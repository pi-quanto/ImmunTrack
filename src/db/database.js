import Dexie from 'dexie'

// We create a Dexie instance — think of it as "opening" our local database
// Dexie wraps the browser's IndexedDB, which is a key-value store built into every modern browser
// IndexedDB persists across page reloads and even app restarts — unlike localStorage
const db = new Dexie('ImmunTrackDB')

// db.version(1).stores() defines the schema — the tables and which fields are indexed
// The '++id' prefix means: auto-increment integer primary key
// Other fields listed here are indexed (queryable) — unlisted fields still save, just can't filter by them
db.version(1).stores({
  // children table: stores one row per registered child
  // phone and healthId are indexed so we can search/lookup by them quickly offline
  children: '++id, healthId, fullName, phone, syncStatus, createdAt',

  // vaccinations table: each dose given is one row
  // childId links back to the children table (like a foreign key, though Dexie doesn't enforce it)
  vaccinations: '++id, childId, vaccineName, doseNumber, syncStatus, dateGiven',

  // syncQueue holds operations waiting to be sent to the server
  // Each entry is a record of what needs to be synced: type (child|vaccine), action (create|update), payload
  syncQueue: '++id, type, recordId, status, createdAt',
})

db.version(2).stores({
  children: '++id, localId, healthId, fullName, phone, syncStatus, createdAt, updatedAt, serverId',
  vaccinations: '++id, localId, childLocalId, childId, vaccineName, doseNumber, syncStatus, dateGiven, createdAt, updatedAt, serverId',
  syncQueue: '++id, type, action, recordId, status, createdAt, updatedAt',
}).upgrade(async (tx) => {
  const timestamp = now()

  await tx.table('children').toCollection().modify((child) => {
    child.localId ??= createLocalId('child')
    child.updatedAt ??= child.createdAt ?? timestamp
    child.syncStatus ??= 'pending'
  })

  await tx.table('vaccinations').toCollection().modify((vaccination) => {
    vaccination.localId ??= createLocalId('vaccination')
    vaccination.childLocalId ??= vaccination.childId ?? null
    vaccination.updatedAt ??= vaccination.createdAt ?? timestamp
    vaccination.syncStatus ??= 'pending'
  })

  await tx.table('syncQueue').toCollection().modify((item) => {
    item.action ??= 'create'
    item.updatedAt ??= item.createdAt ?? timestamp
    item.status ??= 'pending'
    // Ensure recordId exists for old items
    if (!item.recordId) {
      item.recordId = createLocalId(item.type || 'unknown')
    }
  })
})

// Helper to generate the IM-YYYY-NNNN format Health ID
// We use the current year + a random 4-digit number padded with zeros
export function generateHealthId() {
  const year = new Date().getFullYear()
  const num = Math.floor(1000 + Math.random() * 9000)
  return `IM-${year}-${num}`
}

// Helper to generate timestamps — stored as ISO strings for readability
export function now() {
  return new Date().toISOString()
}

export function createLocalId(prefix = 'record') {
  const unique = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${unique}`
}

export default db
