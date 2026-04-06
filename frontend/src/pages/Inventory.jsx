import InventoryGrid from '../components/Inventory/InventoryGrid'

const Inventory = () => {
  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary m-0">Estoque</h1>
        </div>
      </div>
      <InventoryGrid />
    </div>
  )
}

export default Inventory
