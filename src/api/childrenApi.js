import db from '../db/database'
import { apiRequest } from './client'

function mapServerChild(child) {
  return {
    id: child.id,
    localId: child.id,
    doctorId: child.doctor_id,
    fullName: child.full_name,
    dateOfBirth: child.dob,
    sex: child.gender,
    guardianName: child.parent_name,
    phone: child.phone,
    village: child.address,
    clinic: child.address,
    healthId: child.id,
    createdAt: child.created_at,
    syncStatus: 'synced',
    serverId: child.id,
  }
}

export async function fetchChildrenByDoctor(doctorId) {
  if (!doctorId) return []

  try {
    const data = await apiRequest(`/children/${doctorId}`)
    const children = (data.children || []).map(mapServerChild)

    await db.transaction('rw', db.children, async () => {
      for (const child of children) {
        const existing = await db.children.where('serverId').equals(child.serverId).first()
        if (existing) {
          await db.children.update(existing.id, {
            ...child,
            localId: existing.localId || child.localId,
          })
        } else {
          await db.children.add(child)
        }
      }
    })

    return children
  } catch {
    return db.children.orderBy('createdAt').reverse().toArray()
  }
}

export async function fetchChildProfile(childId) {
  if (!childId) throw new Error('Child ID is required')

  try {
    const data = await apiRequest(`/children/profile/${childId}`)
    const child = mapServerChild(data.child)
    return child
  } catch {
    const localChild = await db.children.where('localId').equals(childId).first()
      || await db.children.where('serverId').equals(childId).first()
      || await db.children.get(Number.isNaN(Number(childId)) ? undefined : Number(childId))

    if (!localChild) throw new Error('Child not found')
    return localChild
  }
}

export async function updateChildProfile(childId, payload) {
  const normalized = {
    fullName: payload.fullName.trim(),
    dateOfBirth: payload.dateOfBirth,
    sex: payload.sex,
    guardianName: payload.guardianName.trim(),
    phone: payload.phone.trim(),
    village: payload.village.trim(),
  }

  const localChild = await db.children.where('localId').equals(childId).first()
    || await db.children.where('serverId').equals(childId).first()

  const serverId = localChild?.serverId || childId

  try {
    await apiRequest(`/children/update/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify({
        full_name: normalized.fullName,
        dob: normalized.dateOfBirth,
        gender: normalized.sex,
        parent_name: normalized.guardianName,
        phone: normalized.phone,
        address: normalized.village,
      }),
    })
  } catch (error) {
    if (!localChild?.serverId) {
      await db.children.update(localChild.id, {
        ...normalized,
        syncStatus: 'pending',
        updatedAt: new Date().toISOString(),
      })
      return { offline: true }
    }
    throw error
  }

  if (localChild) {
    await db.children.update(localChild.id, {
      fullName: normalized.fullName,
      dateOfBirth: normalized.dateOfBirth,
      sex: normalized.sex,
      guardianName: normalized.guardianName,
      phone: normalized.phone,
      village: normalized.village,
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    })
  }

  return { offline: false }
}
