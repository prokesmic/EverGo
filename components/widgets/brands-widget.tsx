import { ShoppingBag } from "lucide-react"

export function BrandsWidget() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-brand-blue" />
                    <h3 className="font-semibold text-gray-800 text-sm">Favourite Brands</h3>
                </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-xs text-gray-500">NIKE</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Nike</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-xs text-gray-500">ADI</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Adidas</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-xs text-gray-500">UA</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Under A.</span>
                </div>
            </div>
        </div>
    )
}
