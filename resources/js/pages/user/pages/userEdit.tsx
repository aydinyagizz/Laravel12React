import {
    toast
} from "sonner"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"

import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Input
} from "@/components/ui/input"
import {
    PasswordInput
} from "@/components/ui/password-input"
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import axios from 'axios';
import { router } from '@inertiajs/react';

const formSchema = z.object({
    name: z.string().min(1).min(2).max(20),
    email: z.string().min(1).email(),
    password: z.string(),
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Edit',
        href: '/user/edit/',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}


export default function MyForm(user: User) {

    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.user.name,
            email: user.user.email,
            password: '',
        },

    })

    function onSubmit(values: z.infer < typeof formSchema > ) {
        try {

           axios.put(`/user/updateUser/${user.user.id}`, values).then((response) => {
               toast.success("Kullanıcı bilgileri başarıyla guncellendi " + response.data.user.name);

               router.visit(`/user`);

           }).catch((error) => {
               toast.error("Kullanıcı bilgileri guncellenemedi " + error);
           })
        } catch (error) {
            toast.error("Bir hata oluştu " + error);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className={"px-8 mx-8 mt-5"}>
                <CardHeader>
                    <CardTitle>User Edit</CardTitle>
                    <CardDescription>Update your account's profile information and email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder=""

                                                type="text"
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Email"

                                                type="email"
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormDescription>Şifre en az 6 karakter olmalı</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AppLayout>
    )
}
