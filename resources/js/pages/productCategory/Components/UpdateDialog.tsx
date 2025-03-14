import { useState, useEffect } from "react";
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
import { Pencil } from 'lucide-react';  // Changed from Plus to Pencil icon for update

interface ProductCategory {
    id: number;
    name: string;
}

interface UpdateDialogProps {
    categoryId: number;
    onSuccess: () => void;
}

export function UpdateDialog({ categoryId, onSuccess }: UpdateDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        name: ""
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    const fetchProductData = async () => {
        if (!categoryId) return;

        setFetchLoading(true);
        try {
            const response = await axios.get(`/productCategory/getById/${categoryId}`);
            if (response.data && response.data.category) {
                setFormData({
                    id: response.data.category.id,
                    name: response.data.category.name,
                });
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
        if (open && categoryId) {
            fetchProductData();
        }
    }, [open, categoryId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name) {
            toast.error("Lütfen tüm alanları doldurun.");
            setLoading(false);
            return;
        }

        try {

            // Using PUT request as specified in your route
            const response = await axios.put(`/productCategory/updateCategory/${categoryId}`, formData);

            toast.success("Ürün kategorisi başarıyla güncellendi: " + response.data.productCategory.name);

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={"bg-green-700 hover:bg-green-800"} size="icon" onClick={() => setOpen(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Kategori Güncelle</DialogTitle>
                    <DialogDescription>
                        Kategori bilgisini güncelleyin ve kaydet butonuna tıklayın.
                    </DialogDescription>
                </DialogHeader>
                {fetchLoading ? (
                    <div className="flex justify-center py-8">
                        <p>Kategori bilgileri yükleniyor...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Kategori Adı</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="col-span-3"
                                />
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
