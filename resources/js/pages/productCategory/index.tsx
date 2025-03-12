'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Trash } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { CreateDialog } from '@/pages/productCategory/Components/CreateDialog';
import { UpdateDialog } from '@/pages/productCategory/Components/UpdateDialog';
import type { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

export type ProductCategory = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Product Category', href: '/productCategory' }];




export default function ProductCategory() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [getProductCategory, setGetProductCategory] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);

    const fetchCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/productCategory/getAll');

            if (response.data && response.data.productCategory) {
                const data = response.data.productCategory.map((productCategory: ProductCategory) => ({
                    id: productCategory.id.toString(),
                    name: productCategory.name,

                }));

                setGetProductCategory(data);
            } else {
                setGetProductCategory([]);
            }
        } catch {
            setGetProductCategory([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteProductCategory = (id: number) => {
        try {
            axios
                .delete(`/productCategory/delete/${id}`)
                .then((response) => {
                    toast.success(response.data.message);
                    fetchCategory();
                    // router.visit(`/productCategory`);
                    // setGetProduct((prevProducts) => prevProducts.filter((product) => product.id !== id));
                })
                .catch((error) => {
                    console.log(error);
                    if (error.response && error.response.data && error.response.data.message) {
                        toast.error(error.response.data.message);
                    } else {
                        toast.error('Ürün kategorisi silinemedi');
                    }
                });
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Bir hata oluştu ' + error);
            }
        }
    };

    const bulkDeleteProductCategory = async () => {
        try {
            // Get the selected row IDs
            const selectedRowIndices = Object.keys(rowSelection);

            if (selectedRowIndices.length === 0) {
                toast.error('Silmek için ürün seçilmedi');
                return;
            }

            const selectedProductCategoryIds = selectedRowIndices.map(index => {
                const row = table.getRow(index);
                return Number(row.original.id);
            });

            // Send a request to delete multiple products
            const response = await axios.post('/productCategory/bulkDelete', { ids: selectedProductCategoryIds });

            toast.success(response.data.message || 'Seçili ürün kategorileri başarıyla silindi');

            // Clear selection after successful deletion
            setRowSelection({});

            // Refresh the product list
            fetchCategory();
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Toplu silme işlemi başarısız: ' + error.response.data.message);
            } else {
                toast.error('Toplu silme işlemi başarısız');
            }
        } finally {
            // Close the alert dialog
            setBulkDeleteAlertOpen(false);
        }
    };


    // Define columns inside the component to have access to fetchProduct
    const columns: ColumnDef<ProductCategory>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Name
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
        },

        {
            header: 'Actions',
            cell: ({ row }) => {
                const [alertOpen, setAlertOpen] = useState(false);

                return (
                    <div className="flex items-center space-x-2">
                        <UpdateDialog categoryId={Number(row.original.id)} onSuccess={() => fetchCategory()} />
                        <Button className={"bg-red-700 hover:bg-red-800 text-white"} size="icon" onClick={() => setAlertOpen(true)}>
                            <Trash/>
                        </Button>

                        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{row.original.name} ürününü silmek istediğinize emin misiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bu işlem geri alınamaz!
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAlertOpen(false)}>İptal Et</AlertDialogCancel>
                                    <AlertDialogAction className={"bg-red-500 text-white hover:bg-red-600"} onClick={() => deleteProductCategory(Number(row.original.id))}>Sil</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: getProductCategory,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Yeni ürün ekledikten sonra verileri güncelle
    // const handleNewProduct = (newProductCategory: ProductCategory) => {
    //     setGetProductCategory((prevProduct) => [
    //         ...prevProduct,
    //         {
    //             id: newProductCategory.id,
    //             name: newProductCategory.name,
    //             description: newProductCategory.description,
    //             price: newProductCategory.price,
    //         },
    //     ]);
    // };

    const hasSelectedRows = Object.keys(rowSelection).length > 0;

    useEffect(() => {
        fetchCategory();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="w-full p-4">
                <div className="mb-4 flex items-center justify-between">
                    <Input
                        placeholder="Filter names..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                    <div className={'flex'}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div>
                                    <Button variant="outline" className="mr-2 ml-auto">
                                        Columns <ChevronDown />
                                    </Button>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Conditional rendering based on selection */}
                        {hasSelectedRows ? (
                            <Button
                                className="bg-red-700 hover:bg-red-800 text-white"
                                onClick={() => setBulkDeleteAlertOpen(true)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Seçilenleri Sil
                            </Button>
                        ) : (
                            <CreateDialog onSuccess={() => fetchCategory()} />
                        )}

                        {/*<CreateDialog onSuccess={() => fetchProduct()} />*/}

                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-muted-foreground flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Seçili ürünleri silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {table.getFilteredSelectedRowModel().rows.length} ürün seçtiniz. Bu işlem geri alınamaz!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBulkDeleteAlertOpen(false)}>İptal Et</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={bulkDeleteProductCategory}>
                            Seçilenleri Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
