"use client" 
import { useGetUsersQuery } from '@/state/api'
import React from 'react'
import { useAppSelector } from '@/state/store';
import Header from '@/components/Header';
import { DataGrid, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid';
import Image from 'next/image';
import { dataGridClassName, dataGridSxStyles } from '@/lib/utils';

const CustomToolbar = () => (
    // 6:17:00
    <GridToolbarContainer className = 'toolbar flex gap-2'>
        <GridToolbarFilterButton />
        <GridToolbarExport />
    </GridToolbarContainer>
)
const colums: GridColDef[] = [
    {field: "userId", headerName: "ID", width: 100 },
    {field: "username", headerName: "Username", width: 150 },
    {field: "profilePictureUrl", headerName: "Profile Picture", width: 100,
        renderCell: ( params ) => (
            <div className='flex h-full w-full items-center justify-center'>
                <div className='h-9 w-9'>
                    <Image
                        src = {`https://mp-s3-images.s3.us-east-1.amazonaws.com/${ params.value }`}
                        alt = { params.row.username }
                        width = { 100 }
                        height = { 50 } 
                        className='h-full rounded-full object-cover'
                    />
                </div>
            </div>
        )
     },


]

const Users = () => {
    const {data: users, isLoading, isError } = useGetUsersQuery();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    if( isLoading ) return <div> Loading ... </div>
    if( isError || !users ) return <div> Error fetching users</div> 

  return (
    <div className='flex w-full flex-col p-8'>
        <Header name='Users' />
        <div style={{ height: 650, width: '100%' }}>
            <DataGrid
                rows = { users || [] }
                columns = { colums }
                getRowId = {(row) => row.userId }
                pagination
                slots = {{
                    toolbar: CustomToolbar
                }}
                className={dataGridClassName}
                sx = { dataGridSxStyles(isDarkMode) }
            />
        </div>
    </div>
  )
}

export default Users