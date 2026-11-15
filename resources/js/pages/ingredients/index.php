import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Ingredient {
id: number;
name: string;
quantity: string;
unit: string;
price: string;
storage_location: string;
estimated_expiry_date: string | null;
category: {
id: number;
name: string;
};
}

interface Props {
ingredients: {
data: Ingredient[];
current_page: number;
last_page: number;
total: number;
};
}

export default function Index({ ingredients }: Props) {
return (
<AppLayout>

    <Head title="Inventory" />

    <div className="p-6 space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Food Inventory
            </h1>
            <p className="text-gray-500">
                Manage and monitor your food ingredients.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5">
                <p className="text-sm text-gray-500">
                    Total Ingredients
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                    {ingredients.total}
                </h2>
            </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b p-5">
                <h2 className="font-semibold">Ingredient List</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="p-4">Ingredient</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Storage</th>
                            <th className="p-4">Expiry Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ingredients.data.length > 0 ? (
                        ingredients.data.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="p-4 font-medium">
                                {item.name}
                            </td>
                            <td className="p-4">
                                {item.category?.name ?? '-'}
                            </td>
                            <td className="p-4">
                                {item.quantity} {item.unit}
                            </td>
                            <td className="p-4">
                                {item.storage_location}
                            </td>
                            <td className="p-4">
                                {item.estimated_expiry_date ?? '-'}
                            </td>
                        </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                No ingredients found. Your inventory
                                is currently empty.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</AppLayout>
);
}