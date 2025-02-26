"use client"

import { useSearchQuery } from '@/state/api';
import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { debounce } from "lodash";
import Header from '@/components/Header';
import TaskCard from '@/components/TaskCard';
import ProjectCard from '@/components/ProjectCard';
import UserCard from '@/components/Usercard';

const Search = () => {
    const [ searchTerm, setSearchTerm ] = useState("");
    const { data: searchResults, isLoading, isError} = useSearchQuery(searchTerm, {
        skip: searchTerm.length < 3, 
    });

    const handleSearch = useCallback(
       (event: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value);
        }, []);

    useEffect(() => {
        return () => {
            handleSearch.cancel();
        };
    }, [handleSearch]);

  return (
    <div className='p-8'>
        <Header name="Search" />
        <div>
            <input type='text'
            placeholder='Search...'
            className='w-1/2 rounded border p-3 shadow dark:bg-gray-700 dark:text-white dark:border-dark-secondary'
            onChange={ handleSearch }
            />
        </div>
        <div className='p-5'>
            { isLoading && <p>Loading...</p> }
            { isError && <p>Error occured while fetching search results.</p>}
            { !isLoading && !isError && searchResults && (
                <div>
                    { searchResults.tasks && searchResults.tasks?.length > 0 && (
                        <h2>Tasks</h2>
                    )}
                    { searchResults.tasks?.map((task)=>(
                        <TaskCard key={ task.id} task={task} />
                    ))}

                    { searchResults.projects && searchResults.projects?.length > 0 && (
                        <h2>Projects</h2>
                    )}
                    { searchResults.projects?.map((project)=>(
                        <ProjectCard key={ project.id} project={project} />
                    ))}

                    { searchResults.users && searchResults.users?.length > 0 && (
                        <h2>Users</h2>
                    )}
                    { searchResults.users?.map((user)=>(
                        <UserCard key={ user.userId} user={user} />
                    ))}

                </div>
            )}
        </div>
    </div>
  )
}

export default Search