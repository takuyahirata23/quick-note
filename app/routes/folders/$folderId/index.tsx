import { useState } from 'react'
import { PencilAltIcon, DotsVerticalIcon } from '@heroicons/react/outline'
import { Link, useLoaderData, json } from 'remix'
import { Dialog, Menu } from '@headlessui/react'
import { AiOutlineDelete } from 'react-icons/ai'
import { map, isEmpty, complement } from 'ramda'

import { requiredUserId, getSessionFlashMessage } from '~/utils/session.server'
import { getAllNotes, getFolderWithNotes } from '~/db/notes/operations.server'
import { BackLink, ErrorLayout, NoteCard, SnackBar } from '~/components'

import type { LoaderFunction } from 'remix'

const noteRenderer = map((note: any) => (
  <li key={note.id}>
    <Link to={`${note.id}`}>
      <NoteCard {...note} />
    </Link>
  </li>
))

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requiredUserId(request)
  const { folderId } = params
  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  const res =
    folderId === 'all'
      ? await getAllNotes(userId)
      : await getFolderWithNotes(userId, folderId as string)

  const { message, removeSessionFlashMessage } = await getSessionFlashMessage(
    request
  )

  return json(
    { message, ...res, variant: status === 'success' ? 'info' : 'error' },
    {
      headers: {
        'Set-Cookie': await removeSessionFlashMessage()
      }
    }
  )
}

export default function NoteFolderDetail() {
  const [isOpen, setIsOpen] = useState(false)
  const { folder, notes, message, variant } = useLoaderData()
  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  const isAll = folder.id === 'all'
  console.log(notes)

  return (
    <div>
      <BackLink to="/folders" label="Folders" />
      <SnackBar message={message} variant={variant} />
      {!isAll && (
        <Dialog
          onClose={handleClose}
          open={isOpen}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <Dialog.Overlay className="fixed inset-0" />
          <div className="fixed w-8/12  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gray-50 p-5 rounded-md">
              <Dialog.Title className="font-medium">
                Are you sure you want to delete this folder?
              </Dialog.Title>
              <Dialog.Description>
                All notes in this folder will be deleted as well.
              </Dialog.Description>
              <div className="flex gap-x-4 p-6 overflow-hidden justify-center">
                <button onClick={handleClose}>Cancel</button>
                <form method="post" action={`/folders/${folder.id}/delete`}>
                  <button type="submit" className="flex gap-x-2">
                    Yes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl lg:text-3xl">
          {folder.name} ({folder.notes_count})
        </h2>
        <Link to="new" className="flex gap-x-2 items-center ml-auto mr-2">
          <PencilAltIcon className="h-6 w-6" />{' '}
          <span className="lg:text-lg">Add Note</span>
        </Link>
        {!isAll && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center">
              <DotsVerticalIcon className="w-6 h-6" />
            </Menu.Button>
            <Menu.Items className="z-10 absolute right-0 w-56 mt-2 origin-top-right bg-gray-600 rounded-sm shadow-lg">
              <div className="p-2 flex flex-col gap-y-4">
                <Menu.Item>
                  {() => (
                    <Link to="edit" className="flex gap-x-2 items-center">
                      <PencilAltIcon className="h-5 w-5" />{' '}
                      <span>Rename Folder</span>
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {() => (
                    <button
                      type="button"
                      className="flex gap-x-2 items-center"
                      onClick={handleOpen}
                    >
                      <AiOutlineDelete className="w-5 h-5" />
                      <span>Delete Folder</span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-y-8">
        {complement(isEmpty)(notes.pinned) && (
          <div>
            <h3 className="text-xl text-medium mb-2">Pinned</h3>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {noteRenderer(notes.pinned)}
            </ul>
          </div>
        )}
        <div>
          <h3 className="text-xl text-medium mb-2">Notes</h3>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {noteRenderer(notes.unpinned)}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return <ErrorLayout />
}
