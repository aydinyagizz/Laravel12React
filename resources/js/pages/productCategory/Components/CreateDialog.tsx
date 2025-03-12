import { useState } from "react";
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
import { Plus } from 'lucide-react';


interface ProductCategory {
    id: number;
    name: string;
}

export function CreateDialog({ onSuccess }: { onSuccess: (newProductCategory: ProductCategory) => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log(formData);
        e.preventDefault();
        setLoading(true);

        if (!formData.name) {
            alert("Lütfen tüm alanları doldurun.");
            setLoading(false);
            return;
        }

        try {
            // Make sure the URL is correct - this should match your Laravel API route
            const response = await axios.post("/productCategory/create", formData);

            toast.success("Ürün kategorisi başarıyla eklendi " + response.data.productCategory.name)

            // Yeni kullanıcıyı anında eklemek için onSuccess fonksiyonunu çağır
            onSuccess(response.data.productCategory);

            // Formu temizle ve dialogu kapat
            setOpen(false);
            setFormData({ name: "" });
        } catch (error) {
           toast.error("Ürün kategorisi eklenemedi" + error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setOpen(true)}>
                    <Plus/>
                    Yeni Kategori Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Kategori Ekle</DialogTitle>
                    <DialogDescription>
                        Yeni bir kategori ekleyin. Bilgileri doldurduktan sonra kaydet butonuna tıklayın.
                    </DialogDescription>
                </DialogHeader>
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
                                autoComplete={"off"}
                            />
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
