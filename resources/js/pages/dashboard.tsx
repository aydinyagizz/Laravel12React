import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import * as React from "react";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const chartConfig = {
    users: { label: "Kullanıcı Sayısı" },
    products: { label: "Ürün Sayısı" },
} satisfies ChartConfig;

interface ChartData {
    date: string;
    users: number;
    products: number;
}

export default function Dashboard({ chartData } : { chartData: ChartData[] }) {
    const formattedData = chartData.map(item => ({
        date: new Date(item.date).toISOString().split('T')[0],
        users: item.users || 0,
        products: item.products || 0,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Card className="m-4">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1 text-center sm:text-left">
                        <CardTitle>Dashboard İstatistikleri</CardTitle>
                        <CardDescription>
                            Son bir aydaki kullanıcı ve ürün sayıları
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillProducts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                            />
                            <YAxis />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    labelFormatter={(value) => new Date(value).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                                    indicator="dot"
                                />}
                            />
                            <Area
                                dataKey="users"
                                type="monotone"
                                fill="url(#fillUsers)"
                                stroke="#4F46E5"
                                stackId="1"
                                name="Kullanıcı Sayısı"
                            />
                            <Area
                                dataKey="products"
                                type="monotone"
                                fill="url(#fillProducts)"
                                stroke="#10B981"
                                stackId="2"
                                name="Ürün Sayısı"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
