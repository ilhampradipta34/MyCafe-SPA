import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Label,
  Textarea,
  TextInput,
  Pagination,
  Spinner,
} from "flowbite-react";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import React from "react";
import { cn } from "../../../utils/cn";

export function TopDataTable({
  title = "User",
  description,
  nameButton,
  children,
  titleDrawer,
  titleIcon,
  isOpenDrawer,
  setIsOpenDrawer,
  search,
  setSearch,
  showCreateButton = true,
}) {
  const handleClose = () => setIsOpenDrawer(false);
  return (
    <div className="">
      <div className="flex flex-col justify-start">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="font-light text-gray-400 text-md">{description}</p>
      </div>
      <div className={cn("flex items-center justify-between", showCreateButton ? "-mt-24" : "mt-6 mb-28")}>
        <div>
          <Label htmlFor="search" className="block mb-2 !text-black">
            Search
          </Label>
          <div className="relative">
            <TextInput
              id="search"
              name="search"
              placeholder="search..."
              type="text"
              color="white"
              className="!border-none shadow-md"
              icon={CiSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute text-gray-400 -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-600"
              >
                <IoIosClose size={20} />
              </button>
            )}
          </div>
        </div>
        {showCreateButton ? (
          <div>
            <div className="flex min-h-[50vh] items-center justify-center">
              <Button
                onClick={() => setIsOpenDrawer(true)}
                className="shadow-md cursor-pointer"
              >
                {nameButton}
              </Button>
            </div>
            <Drawer
              open={isOpenDrawer}
              onClose={handleClose}
              position="right"
              className="w-1/3"
            >
              <DrawerHeader title={titleDrawer} titleIcon={titleIcon} />
              <DrawerItems>{children}</DrawerItems>
            </Drawer>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BottomDataTable({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  totalPages,
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between">
      <span className="mb-2 text-sm font-semibold text-black sm:mb-0 ">
        Showing {start} to {end} of {totalItems} Entries
      </span>
      <div className="flex overflow-x-auto shadow-md">
        {totalPages > 1 && (
          <Pagination
            className="cursor-pointer"
            showIcons
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function DataTable({
  title,
  description,
  nameButton,
  columns = [],
  data = [],
  onEdit,
  onDelete,
  empty,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  children,
  titleDrawer,
  titleIcon,
  isOpenDrawer,
  setIsOpenDrawer,
  isFetching,
  search,
  setSearch,
  totalPages,
  showCreateButton = true,
}) {
  return (
    <>
      <TopDataTable
        title={title}
        description={description}
        nameButton={nameButton}
        titleDrawer={titleDrawer}
        titleIcon={titleIcon}
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
        search={search}
        setSearch={setSearch}
        showCreateButton={showCreateButton}
      >
        {children}
      </TopDataTable>
      
      <div className="mb-4 -mt-24 overflow-x-auto shadow-md">
        <Table hoverable>
          <TableHead>
            <TableRow className="[&_*]:bg-gray-100 [&_*]:text-black [&_*]:font-bold ">
              {columns.map((column) => (
                <TableHeadCell key={column.key}>{column.label}</TableHeadCell>
              ))}
              {(onEdit || onDelete) && <TableHeadCell>Actions</TableHeadCell>}
            </TableRow>
          </TableHead>
          <TableBody className="divide-y [&>*]:bg-gray-50 [&>*]:hover:bg-white [&_*]:text-black">
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="py-10 text-center"
                >
                  <Spinner size="lg" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="py-4 text-center"
                >
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="flex items-center h-16 gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="[&_*]:text-blue-600 cursor-pointer hover:underline"
                        >
                          <FaRegEdit />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="[&_*]:text-red-600 cursor-pointer hover:underline"
                        >
                          <MdDelete />
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <BottomDataTable
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </>
  );
}
