import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"
import { Check, ChevronsUpDown, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
}

interface UpdateDialogProps {
    productId: number;
    onSuccess: () => void;
}

export function UpdateDialog({ productId, onSuccess }: UpdateDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        description: "",
        price: 0,
        category_id: 0
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    const fetchProductData = async () => {
        if (!productId) return;

        setFetchLoading(true);
        try {
            const response = await axios.get(`/product/getById/${productId}`);
            if (response.data && response.data.product) {
                console.log(response.data);
                const product = response.data.product;
                setFormData({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category_id: product.category_id
                });

                // Kategori bilgisini set et
                if (product.category) {
                    setSelectedCategoryId(product.category_id);
                    setSelectedCategoryName(product.category.name);
                }
            }
        } catch (error) {
            toast.error("Ürün bilgileri yüklenemedi");
            console.error("Error fetching product:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    // Fetch product data when dialog opens
    useEffect(() => {
        if (open && productId) {
            fetchProductData();
        }
    }, [open, productId]);

    const fetchCategory = async () => {
        try {
            const response = await axios.get('/productCategory/getAll');
            setCategories(response.data.productCategory);
        } catch (error) {
            toast.error("Kategoriler yüklenemedi: " + error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCategory();
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
            toast.error("Lütfen tüm alanları doldurun.");
            setLoading(false);
            return;
        }

        try {
            // Using PUT request as specified in your route
            const response = await axios.put(`/product/updateProduct/${productId}`, formData);

            toast.success("Ürün başarıyla güncellendi: " + response.data.product.name);

            // Call onSuccess to refresh the product list
            onSuccess();

            // Close dialog
            setOpen(false);
        } catch (error) {
            toast.error("Ürün güncellenemedi");
            console.error("Update error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        const selectedCategory = categories.find(cat => cat.name === categoryName);

        if (selectedCategory) {
            setSelectedCategoryId(selectedCategory.id);
            setSelectedCategoryName(selectedCategory.name);
            setFormData(prevFormData => ({
                ...prevFormData,
                category_id: selectedCategory.id
            }));
        } else {
            setSelectedCategoryId(null);
            setSelectedCategoryName("");
            setFormData(prevFormData => ({
                ...prevFormData,
                category_id: 0
            }));
        }

        setSelectOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={"bg-green-700 hover:bg-green-800"} size="icon" onClick={() => setOpen(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Ürün Güncelle</DialogTitle>
                    <DialogDescription>
                        Ürün bilgilerini güncelleyin ve kaydet butonuna tıklayın.
                    </DialogDescription>
                </DialogHeader>
                {fetchLoading ? (
                    <div className="flex justify-center py-8">
                        <p>Ürün bilgileri yükleniyor...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Ürün Adı</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Açıklama</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Fiyat</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category_id" className="text-right">Kategori</Label>
                                <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                                    <PopoverTrigger asChild className="col-span-3">
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={selectOpen}
                                            className="w-full justify-between"
                                        >
                                            {selectedCategoryName || "Kategori seçin..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Kategori ara..." />
                                            <CommandList>
                                                <CommandEmpty>Kategori bulunamadı.</CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem
                                                            key={category.id}
                                                            value={category.name}
                                                            onSelect={() => handleCategorySelect(category.name)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {category.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Güncelleniyor..." : "Güncelle"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
