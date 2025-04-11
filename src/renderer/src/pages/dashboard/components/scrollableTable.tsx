import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'

interface ScrollableTableProps {
  headers: string[]
  maxHeight?: string
  children: React.ReactNode
}

export function ScrollableTable({ headers, maxHeight = '400px', children }: ScrollableTableProps) {
  return (
    <div className="rounded-md border">
      <div style={{ maxHeight, overflow: 'auto', scrollbarColor: 'red' }}>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </div>
  )
}
