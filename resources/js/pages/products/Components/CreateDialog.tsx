import React, { useEffect, useState } from 'react';
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
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
}

interface Category {
    id: number;
    name: string;
}

export function CreateDialog({ onSuccess }: { onSuccess: (newProduct: Product) => void }) {
    const [open, setOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        category_id: null as number | null
    });
    const [loading, setLoading] = useState(false);

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
            // Make sure the URL is correct - this should match your Laravel API route
            const response = await axios.post("/product/create", formData);

            toast.success("Ürün başarıyla eklendi: " + response.data.products.name);

            // Yeni ürünü anında eklemek için onSuccess fonksiyonunu çağır
            onSuccess(response.data.products);

            // Formu temizle ve dialogu kapat
            setOpen(false);
            setFormData({
                name: "",
                description: "",
                price: 0,
                category_id: null
            });
            setSelectedCategoryId(null);
            setSelectedCategoryName("");
        } catch (error) {
            toast.error("Ürün eklenemedi: " + error);
        } finally {
            setLoading(false);
        }
    };

    // Kategorileri çekiyoruz
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

    // Category selection handler
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
                category_id: null
            }));
        }

        // Select dropdown'u kapat, ancak modal açık kalsın
        setSelectOpen(false);
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Ürün Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Ürün Ekle</DialogTitle>
                    <DialogDescription>
                        Yeni bir ürün ekleyin. Bilgileri doldurduktan sonra kaydet butonuna tıklayın.
                    </DialogDescription>
                </DialogHeader>
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
                                autoComplete="off"
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
                                autoComplete="off"
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
                                                        onSelect={handleCategorySelect}
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
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
