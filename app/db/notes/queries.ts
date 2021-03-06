export const createFolderQuery = `
  INSERT INTO folders(name, user_id) VALUES($1, $2)
`

export const createNoteQuery = `
  INSERT INTO notes(title, description, copy, user_id, folder_id) VALUES($1, $2, $3, $4, $5)
`
export const readFolderQuery = `
  SELECT a.id, a.name,  COUNT(b.id) notes_count
  FROM folders a 
  LEFT JOIN notes b
    ON b.folder_id = $2 
  WHERE a.user_id = $1 AND a.id = $2 
  GROUP BY a.id
`

export const readFoldersQuery = `
  SELECT * FROM folders WHERE $1 = folders.user_id
`

export const readNotesUnderFolderQuery = `
  SELECT n.id, n.title, n.copy, n.is_pinned FROM notes AS n
  WHERE n.user_id = $1 AND n.folder_id = $2
  ORDER BY n.is_pinned DESC, n.updated_at DESC
`

export const readAllNotesQuery = `
  SELECT n.id, n.title, n.copy, n.is_pinned FROM notes AS n
  WHERE n.user_id = $1
  ORDER BY n.is_pinned DESC, n.updated_at DESC
`

export const updateFolderQuery = `
  UPDATE folders SET name = $1 WHERE folders.user_id = $2 AND folders.id = $3
`

export const updateNoteQuery = `
  UPDATE notes 
  SET title = $1,
    description = $2,
    copy = $3 
  WHERE notes.user_id = $4 AND notes.id = $5
`

export const updateIsPinnedQuery = `
  UPDATE notes
  SET is_pinned = $1
  WHERE notes.id = $2
`

export const readNoteDetailQuery = `
  SELECT * FROM notes 
  WHERE notes.id = $1
`
export const deleteFolderQuery = `
  DELETE FROM folders WHERE folders.user_id = $1 AND folders.id = $2 
`

export const deleteNoteQuery = `
  DELETE FROM notes WHERE notes.user_id = $1 AND notes.id = $2
`
