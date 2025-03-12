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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { CreateDialog } from '@/pages/products/Components/CreateDialog';
import { UpdateDialog } from '@/pages/products/Components/UpdateDialog';
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

export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Products', href: '/product' }];

const deleteProduct = (id: number) => {
    try {
        axios
            .delete(`/product/delete/${id}`)
            .then((response) => {
                toast.success(response.data.message);
                router.visit(`/product`);
                // setGetProduct((prevProducts) => prevProducts.filter((product) => product.id !== id));
            })
            .catch((error) => {
                toast.error('Ürün silinemedi ' + error);
            });
    } catch (error) {
        if (error instanceof Error) {
            toast.error('Bir hata oluştu ' + error);
        }
    }
};


export default function Products() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [getProducts, setGetProduct] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/product/getAll');

            if (response.data && response.data.products) {
                const data = response.data.products.map((product: Product) => ({
                    id: product.id.toString(),
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category.name
                }));

                setGetProduct(data);
            } else {
                setGetProduct([]);
            }
        } catch {
            setGetProduct([]);
        } finally {
            setLoading(false);
        }
    };

    const bulkDeleteProducts = async () => {
        try {
            // Get the selected row IDs
            const selectedRowIndices = Object.keys(rowSelection);

            if (selectedRowIndices.length === 0) {
                toast.error('Silmek için ürün seçilmedi');
                return;
            }

            const selectedProductIds = selectedRowIndices.map(index => {
                const row = table.getRow(index);
                return Number(row.original.id);
            });

            // Send a request to delete multiple products
            const response = await axios.post('/product/bulkDelete', { ids: selectedProductIds });

            toast.success(response.data.message || 'Seçili ürünler başarıyla silindi');

            // Clear selection after successful deletion
            setRowSelection({});

            // Refresh the product list
            fetchProduct();
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Toplu silme işlemi başarısız: ' + error.message);
            } else {
                toast.error('Toplu silme işlemi başarısız');
            }
        } finally {
            // Close the alert dialog
            setBulkDeleteAlertOpen(false);
        }
    };


    // Define columns inside the component to have access to fetchProduct
    const columns: ColumnDef<Product>[] = [
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
            accessorKey: 'description',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Description
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue('description')}</div>, // Fixed: was 'name', should be 'description'
        },
        {
            accessorKey: 'price',
            header: () => <div className="">Price</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('price'));

                // Format the amount as a dollar amount
                const formatted = new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                }).format(amount);

                return <div className="font-medium">{formatted}</div>;
            },
        },

        {
            accessorKey: 'category',
            header: () => <div className="">Category</div>,
            cell: ({ row }) => <div className="lowercase">{row.getValue('category')}</div>, // Fixed: was 'name', should be 'description'
        },

        {
            header: 'Actions',
            cell: ({ row }) => {
                const [alertOpen, setAlertOpen] = useState(false);

                return (
                    <div className="flex items-center space-x-2">
                        <UpdateDialog productId={Number(row.original.id)} onSuccess={() => fetchProduct()} />
                        <Button className={"bg-red-700 hover:bg-red-800 text-white"} size="icon" onClick={() => setAlertOpen(true)}>
                            <Trash/>
                        </Button>

                        {/*<DropdownMenu>*/}
                        {/*    <DropdownMenuTrigger asChild>*/}
                        {/*        <Button variant="ghost" className="h-8 w-8 p-0">*/}
                        {/*            <span className="sr-only">Open menu</span>*/}
                        {/*            <MoreHorizontal />*/}
                        {/*        </Button>*/}
                        {/*    </DropdownMenuTrigger>*/}
                        {/*    <DropdownMenuContent align="end">*/}
                        {/*        <DropdownMenuLabel>Actions</DropdownMenuLabel>*/}
                        {/*        <DropdownMenuItem className={'text-red-500'} onClick={() => setAlertOpen(true)}>*/}
                        {/*            <Trash className={'text-red-500 mr-2 h-4 w-4'} />*/}
                        {/*            Sil*/}
                        {/*        </DropdownMenuItem>*/}
                        {/*    </DropdownMenuContent>*/}
                        {/*</DropdownMenu>*/}

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
                                    <AlertDialogAction className={"bg-red-500 text-white hover:bg-red-600"} onClick={() => deleteProduct(Number(row.original.id))}>Sil</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: getProducts,
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
    // const handleNewProduct = (newProduct: Product) => {
    //     setGetProduct((prevProduct) => [
    //         ...prevProduct,
    //         {
    //             id: newProduct.id,
    //             name: newProduct.name,
    //             description: newProduct.description,
    //             price: newProduct.price,
    //             category_id: newProduct.category_id,
    //         },
    //     ]);
    // };

    const hasSelectedRows = Object.keys(rowSelection).length > 0;

    useEffect(() => {
        fetchProduct();
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
                            <CreateDialog onSuccess={() => fetchProduct()} />
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
                        <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={bulkDeleteProducts}>
                            Seçilenleri Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
