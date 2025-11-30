import { ShoppingBag, ChevronRight, Tag } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import Link from "next/link"

export function BrandsWidget() {
    const brands = [
        { id: 1, name: "Nike", logo: "N", discount: "15% OFF", color: "bg-black text-white" },
        { id: 2, name: "Adidas", logo: "A", discount: null, color: "bg-black text-white" },
        { id: 3, name: "Garmin", logo: "G", discount: "Member Deal", color: "bg-blue-600 text-white" },
        { id: 4, name: "Salomon", logo: "S", discount: null, color: "bg-red-600 text-white" },
    ]

    return (
        <CardShell
            title="Favourite Brands"
            icon={<ShoppingBag className="h-5 w-5" />}
            action={<Link href="/brands" className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            <div className="grid grid-cols-2 gap-3">
                {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer bg-white group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${brand.color}`}>
                            {brand.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900">{brand.name}</div>
                            {brand.discount && (
                                <div className="text-[10px] font-medium text-brand-blue flex items-center gap-1">
                                    <Tag className="h-2.5 w-2.5" />
                                    {brand.discount}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}
