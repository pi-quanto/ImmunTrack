import db, { createLocalId, now } from './database'
import { apiRequest } from '../api/client'

function formatLogTime(timestamp) {
  if (!timestamp) return 'Pending'

  return new Date(timestamp).toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildChildPayload(child) {
  return {
    localId: child.localId,
    healthId: child.healthId,
    fullName: child.fullName,
    dateOfBirth: child.dateOfBirth,
    sex: child.sex,
    guardianName: child.guardianName,
    phone: child.phone,
    village: child.village,
    clinic: child.clinic ?? null,
    doctorId: child.doctorId ?? null,
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  }
}

function buildVaccinationPayload(vaccination) {
  return {
    localId: vaccination.localId,
    childLocalId: vaccination.childLocalId,
    childId: vaccination.childId,
    childName: vaccination.childName,
    healthId: vaccination.healthId ?? null,
    vaccineName: vaccination.vaccineName,
    doseNumber: vaccination.doseNumber,
    adminSite: vaccination.adminSite,
    batchNumber: vaccination.batchNumber,
    dateGiven: vaccination.dateGiven,
    doctorId: vaccination.doctorId ?? null,
    administeredBy: vaccination.administeredBy ?? null,
    nextDueDate: vaccination.nextDueDate ?? null,
    childServerId: vaccination.childServerId ?? null,
    createdAt: vaccination.createdAt,
    updatedAt: vaccination.updatedAt,
  }
}

async function uploadSyncItem(item) {
  if (item.type === 'child') {
    const payload = item.payload
    const data = await apiRequest('/children/add', {
      method: 'POST',
      body: JSON.stringify({
        doctor_id: payload.doctorId,
        full_name: payload.fullName,
        dob: payload.dateOfBirth,
        gender: payload.sex,
        parent_name: payload.guardianName,
        phone: payload.phone,
        address: payload.village,
        created_at: payload.createdAt,
      }),
    })

    return {
      ...data,
      serverId: data.child?.id || item.recordId,
      syncedAt: now(),
    }
  }

  if (item.type === 'vaccination') {
    const payload = item.payload
    let childServerId = payload.childServerId

    // If we don't have the server ID for the child, try to find it
    if (!childServerId) {
      const linkedChild = payload.childLocalId
        ? await db.children.where('localId').equals(payload.childLocalId).first()
        : null

      if (linkedChild?.serverId) {
        childServerId = linkedChild.serverId
      } else {
        throw new Error(`Child not synced yet for vaccination ${item.recordId}`)
      }
    }

    const data = await apiRequest('/vaccine/vaccine', {
      method: 'POST',
      body: JSON.stringify({
        child_id: childServerId,
        doctor_id: payload.doctorId,
        vaccine_name: payload.vaccineName,
        dose: String(payload.doseNumber),
        date_given: payload.dateGiven,
        next_due_date: payload.nextDueDate || '',
        administered_by: payload.administeredBy || 'Clinic staff',
      }),
    })

    return {
      ...data,
      serverId: data.vaccine?.id || item.recordId,
      syncedAt: now(),
    }
  }

  throw new Error('Unknown sync item type: ' + item.type)
}

function queueLabel(type) {
  return type === 'vaccination' ? 'Vaccination' : 'Child Registration'
}

function queueSubtitle(type, payload) {
  if (type === 'vaccination') {
    const vaccine = payload?.vaccineName ?? 'Dose'
    const child = payload?.childName ?? payload?.healthId ?? 'Unknown child'
    return `${vaccine} queued for ${child}`
  }

  return `${payload?.fullName ?? 'Child record'} queued for sync`
}

export async function saveChildRegistration(form, context = {}) {
  const timestamp = now()
  const localId = createLocalId('child')
  const healthId = context.healthId

  const child = {
    localId,
    healthId,
    fullName: form.fullName.trim(),
    dateOfBirth: form.dob,
    sex: form.sex,
    guardianName: form.guardianName.trim(),
    phone: form.phone.trim(),
    village: form.village,
    clinic: context.clinic ?? null,
    doctorId: context.doctorId ?? null,
    syncStatus: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const payload = buildChildPayload(child)

  const id = await db.transaction('rw', db.children, db.syncQueue, async () => {
    const childId = await db.children.add(child)
    await db.syncQueue.add({
      type: 'child',
      action: 'create',
      recordId: localId,
      payload,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return childId
  })

  return { id, ...child }
}

export async function saveVaccinationRecord({
  child,
  vaccine,
  adminSite,
  batchNumber,
  dateGiven,
  doseNumber = 1,
  doctorId = null,
  administeredBy = null,
  nextDueDate = null,
}) {
  const timestamp = now()
  const localId = createLocalId('vaccination')
  const childLocalId = child.localId ?? child.childLocalId ?? null
  const childIdentifier = child.healthId ?? child.id ?? childLocalId ?? 'unknown-child'

  const vaccination = {
    localId,
    childLocalId,
    childId: childIdentifier,
    childName: child.name ?? child.fullName ?? 'Unknown child',
    healthId: child.healthId ?? null,
    childServerId: child.serverId ?? null,
    doctorId,
    vaccineName: vaccine.name,
    doseNumber,
    adminSite,
    batchNumber: batchNumber.trim(),
    dateGiven,
    administeredBy,
    nextDueDate,
    syncStatus: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const payload = buildVaccinationPayload(vaccination)

  const id = await db.transaction('rw', db.vaccinations, db.syncQueue, async () => {
    const vaccinationId = await db.vaccinations.add(vaccination)
    await db.syncQueue.add({
      type: 'vaccination',
      action: 'create',
      recordId: localId,
      payload,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return vaccinationId
  })

  return { id, ...vaccination }
}

export async function getSyncOverview() {
  const [children, vaccinations, queue] = await Promise.all([
    db.children.toArray(),
    db.vaccinations.toArray(),
    db.syncQueue.orderBy('createdAt').reverse().toArray(),
  ])

  const pendingCount = queue.filter((item) => item.status === 'pending').length
  const syncedCount = queue.filter((item) => item.status === 'synced').length
  const failedCount = queue.filter((item) => item.status === 'failed').length

  const logs = queue.slice(0, 12).map((item) => ({
    id: item.id,
    type: item.type,
    title: queueLabel(item.type),
    subtitle: queueSubtitle(item.type, item.payload),
    status: item.status,
    time: formatLogTime(item.updatedAt ?? item.createdAt),
  }))

  return {
    counts: {
      children: children.length,
      vaccinations: vaccinations.length,
      syncQueue: queue.length,
      pendingCount,
      syncedCount,
      failedCount,
    },
    logs,
  }
}

export async function syncPendingRecords() {
  // First, clean up invalid sync items
  const allPending = await db.syncQueue.where('status').equals('pending').toArray()
  const invalidItems = allPending.filter(item => !item.recordId || typeof item.recordId !== 'string' || (!item.payload && !item.type))

  for (const item of invalidItems) {
    await db.syncQueue.update(item.id, {
      status: 'failed',
      lastError: 'Invalid sync item data',
      updatedAt: now(),
    })
  }

  const pendingItems = await db.syncQueue
    .where('status')
    .equals('pending')
    .filter(item => item.recordId && typeof item.recordId === 'string' && item.type)
    .sortBy('createdAt')

  const results = []

  for (const item of pendingItems) {
    // Skip items with invalid recordId
    if (!item.recordId || typeof item.recordId !== 'string') {
      console.warn('Skipping sync item with invalid recordId:', item)
      continue
    }

    const table = item.type === 'vaccination' ? db.vaccinations : db.children
    let record = null

    try {
      record = await table.where('localId').equals(item.recordId).first()
    } catch (queryError) {
      console.error('Query error for recordId:', item.recordId, queryError)
      await db.syncQueue.update(item.id, {
        status: 'failed',
        lastError: `Query failed: ${queryError.message}`,
        updatedAt: now(),
      })
      continue
    }

    // If no record found and no payload, skip this item
    if (!record && !item.payload) {
      console.warn('Skipping sync item with no record and no payload:', item)
      await db.syncQueue.update(item.id, {
        status: 'failed',
        lastError: 'No record found and no payload',
        updatedAt: now(),
      })
      continue
    }

    const payload = item.payload ?? record ?? null

    try {
      const response = await uploadSyncItem({
        type: item.type,
        action: item.action,
        recordId: item.recordId,
        payload,
      })

      const timestamp = now()
      const resolvedServerId = response.serverId ?? item.recordId

      await db.transaction('rw', table, db.syncQueue, async () => {
        if (record?.id) {
          await table.update(record.id, {
            syncStatus: 'synced',
            serverId: resolvedServerId,
            syncedAt: timestamp,
            updatedAt: timestamp,
          })
        }

        await db.syncQueue.update(item.id, {
          status: 'synced',
          syncedAt: timestamp,
          updatedAt: timestamp,
          lastError: null,
          serverResponse: response,
        })
      })

      results.push({ id: item.id, status: 'synced' })
    } catch (error) {
      console.error('Sync error for item', item.id, ':', error)
      await db.syncQueue.update(item.id, {
        status: 'failed',
        lastError: error.message,
        updatedAt: now(),
      })

      results.push({ id: item.id, status: 'failed', error: error.message })
    }
  }

  return results
}
