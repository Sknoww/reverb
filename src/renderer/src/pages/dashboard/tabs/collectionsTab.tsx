import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Collection, Project } from '@/types'
import { useEffect, useState } from 'react'
import { LuCircleMinus, LuCirclePlay, LuCirclePlus, LuPencil } from 'react-icons/lu'

interface CollectionCardProps {
  project: Project | null
}

export function CollectionsTab({ project }: CollectionCardProps) {
  const [localProject, setLocalProject] = useState<Project | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importPath, setImportPath] = useState('')

  useEffect(() => {
    const loadCollections = async () => {
      try {
        // This would be replaced with actual API call to fetch collections
        if (!project) return
        setLocalProject(project)
        const loadedCollections = project.collections
        setCollections(loadedCollections)
      } catch (error) {
        console.error('Error loading collections:', error)
      }
    }
    loadCollections()
  }, [])

  const handleImportCollection = () => {
    setIsImporting(true)
  }

  const handleBrowseCollection = async () => {
    // This would be replaced with actual file dialog API
    try {
      // Simulate selecting a file
      const filePath = '/selected/path/to/collection.json'
      setImportPath(filePath)
    } catch (error) {
      console.error('Error selecting file:', error)
    }
  }

  const handleSaveCollection = () => {
    if (importPath) {
      // This would be replaced with actual logic to save the collection
      const newCollection: Collection = {
        id: `${collections.length + 1}`,
        name: `Imported Collection ${collections.length + 1}`,
        description: 'Newly imported Postman collection',
        collectionFilePath: importPath
      }

      setCollections([...collections, newCollection])
      setImportPath('')
      setIsImporting(false)
    }
  }

  const handleCancelImport = () => {
    setImportPath('')
    setIsImporting(false)
  }

  const handleRunCollection = async (collection: Collection) => {
    setSelectedCollection(collection)
    const collectionResult = await window.collectionAPI.runCollection(collection.collectionFilePath)
    console.log('Collection result:', collectionResult)
  }

  const handleDeleteCollection = (collectionId: string) => {
    // This would be replaced with actual logic to delete the collection
    const updatedCollections = collections.filter((c) => c.id !== collectionId)
    setCollections(updatedCollections)
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(null)
    }
  }

  const handleEditCollection = (collection: Collection) => {
    console.log('Editing collection:', collection)
    // This would be replaced with actual logic to edit the collection
  }

  // Import Card component
  const ImportCard = () => (
    <Card className="w-full">
      <CardHeader className="w-full p-2 pb-0">
        <span className="text-lg">Import Postman Collection</span>
      </CardHeader>
      <CardContent className="w-full p-2">
        <div className="flex flex-col w-full gap-5">
          <div className="flex flex-row gap-2">
            <Input
              value={importPath}
              className="w-2/3 placeholder:text-opacity-5 border-zinc-700"
              placeholder="Collection File Path"
              readOnly
            />
            <Button className="w-1/6" onClick={handleBrowseCollection}>
              Browse
            </Button>
          </div>
          <div className="flex flex-row w-full gap-2">
            <Button className="w-full" onClick={handleSaveCollection} disabled={!importPath}>
              Save Collection
            </Button>
            <Button className="w-full" variant="outline" onClick={handleCancelImport}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Collection Table component
  const CollectionsTable = () => (
    <div className="w-full rounded-lg border border-zinc-700">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-700">
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>File Path</TableHead>
            <TableHead className="text-right">Description</TableHead>
            <TableHead className="w-[150px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length > 0 ? (
            collections.map((collection) => (
              <TableRow key={collection.id} className="hover:bg-transparent border-zinc-700">
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell>{collection.collectionFilePath}</TableCell>
                <TableCell className="text-right">{collection.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-end justify-end gap-2">
                    <LuCircleMinus
                      size={25}
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="cursor-pointer hover:text-red-500"
                      aria-label="Delete collection"
                      title="Delete collection"
                    />
                    <LuPencil
                      size={25}
                      onClick={() => handleEditCollection(collection)}
                      className="cursor-pointer hover:text-primary"
                      aria-label="Edit collection"
                      title="Edit collection"
                    />
                    <LuCirclePlay
                      size={25}
                      onClick={() => handleRunCollection(collection)}
                      className="cursor-pointer hover:text-green-500"
                      aria-label="Run collection"
                      title="Run collection"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No collections found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  // Selected Collection Details
  const SelectedCollectionDetails = () => {
    if (!selectedCollection) return null

    return (
      <Card className="w-full mt-5">
        <CardHeader className="w-full p-2 pb-0">
          <span className="text-lg">Selected Collection: {selectedCollection.name}</span>
        </CardHeader>
        <CardContent className="w-full p-2">
          <div className="flex flex-col w-full gap-2">
            <div>
              <span className="font-medium">Path: </span>
              <span>{selectedCollection.collectionFilePath}</span>
            </div>
            <div>
              <span className="font-medium">Description: </span>
              <span>{selectedCollection.description}</span>
            </div>
            <div className="flex flex-row w-full mt-3">
              <Button className="w-full" onClick={() => handleRunCollection(selectedCollection)}>
                Run Collection <LuCirclePlay className="ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Header with action button */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">Postman Collections</span>
        {!isImporting && (
          <div
            className="rounded-full p-1 cursor-pointer hover:bg-primary"
            onClick={handleImportCollection}
            title="Import Collection"
          >
            <LuCirclePlus size={25} />
          </div>
        )}
      </div>

      {/* Import form if importing */}
      {isImporting && (
        <div className="py-3">
          <ImportCard />
        </div>
      )}

      {isImporting && <Separator className="my-3" />}

      {/* Collections table */}
      <div className="flex flex-col gap-5">
        <CollectionsTable />
        <SelectedCollectionDetails />
      </div>
    </>
  )
}
