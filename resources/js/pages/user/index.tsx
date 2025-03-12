import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { useState, useEffect } from "react";
import { CreateDialog } from "./Components/CreateDialog";
import axios from "axios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/user',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Index() {
    const [getUsers, setGetUsers] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // Kullanıcı verilerini yükle
    const fetchUsers = async () => {
        setLoading(true);
        try {

            // Updated URL to match your Laravel route
            const response = await axios.get("/user/getAll");

            if (response.data && response.data.users) {
                const data = response.data.users.map((user: User) => ({
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                }));

                setGetUsers(data);
            } else {
                setGetUsers([]);
            }
        } catch {
            setGetUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Yeni kullanıcı ekledikten sonra verileri güncelle
    const handleNewUser = (newUser: User) => {

        setGetUsers(prevUsers => [
            ...prevUsers,
            {
                id: newUser.id.toString(),
                name: newUser.name,
                email: newUser.email,
            }
        ]);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-end p-5">
                <CreateDialog onSuccess={handleNewUser} />
            </div>

            {loading ? (
                <div className="text-center p-4">Yükleniyor...</div>
            ) : (
                <DataTable columns={columns} data={getUsers} />
            )}
        </AppLayout>
    );
}
