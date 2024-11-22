'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IceCream, Popsicle, Package, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'

type Product = {
  id: number
  nombre: string
  precio: number
  categoria: 'paletas' | 'crema' | 'porMayor'
  imagen: string
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', categoria: 'paletas' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    fetch('http://localhost:9000/api/productos')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error))
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...currentCart, { ...product, quantity }]
    })
  }

  

  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0).toFixed(2)
  }

  const handlePayment = (method: 'yape' | 'efectivo') => {
    console.log(`Pago realizado con ${method}. Total: S/ ${getTotalPrice()}`)
    setIsPaymentModalOpen(false)
    setCart([])
  }

  const handleProductClick = (product: Product) => {
    if (product.categoria === 'crema') {
      setSelectedProduct(product)
      setQuantity(1)
    } else {
      addToCart(product)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('nombre', newProduct.nombre)
    formData.append('precio', newProduct.precio)
    formData.append('categoria', newProduct.categoria)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('imagen', fileInputRef.current.files[0])
    }

    try {
      const response = await fetch('http://localhost:9000/api/productos', {
        method: 'POST',
        body: formData,
      })
      console.log("respuesta del servidor")
      console.log(response)
      if (response.ok) {
        fetchProducts()
        setIsAddProductModalOpen(false)
        setNewProduct({ nombre: '', precio: '', categoria: 'paletas' })
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        console.error('Error adding product')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Heladería POS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
            <Button onClick={() => setIsAddProductModalOpen(true)}>Agregar Producto</Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paletas">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paletas">
                  <Popsicle className="w-4 h-4 mr-2" />
                  Paletas
                </TabsTrigger>
                <TabsTrigger value="crema">
                  <IceCream className="w-4 h-4 mr-2" />
                  Crema
                </TabsTrigger>
                <TabsTrigger value="porMayor">
                  <Package className="w-4 h-4 mr-2" />
                  Por Mayor
                </TabsTrigger>
              </TabsList>
              {['paletas', 'crema', 'porMayor'].map((category) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {products
                        .filter((product) => product.categoria === category)
                        .map((product) => (
                          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Image
                              src={product.imagen}
                              alt={product.nombre}
                              width={200}
                              height={200}
                              className="w-full h-48 object-cover"
                              onClick={() => handleProductClick(product)}
                            />
                            <div className="p-4">
                              <h3 className="font-bold text-lg">{product.nombre}</h3>
                              <p className="text-sm text-gray-500">S/ {product.precio}</p>
                              <Button
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={() => handleProductClick(product)}
                              >
                                Agregar al carrito
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      width={30}
                      height={30}
                      className="mr-2"
                    />
                    <span>{item.nombre} x{item.quantity}</span>
                  </div>
                  <div>
                    <span className="mr-2">S/ {(item.precio * item.quantity)}</span>
                    <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-between items-center font-bold text-lg mb-4">
              <span>Total:</span>
              <span>S/ {getTotalPrice()}</span>
            </div>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={cart.length === 0}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Pagar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seleccione el método de pago</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <p className="text-lg font-bold mb-4">Total a pagar: S/ {getTotalPrice()}</p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => handlePayment('yape')}>Yape</Button>
                    <Button onClick={() => handlePayment('efectivo')}>Efectivo</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-4 my-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(q => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (selectedProduct) {
                addToCart(selectedProduct, quantity)
                setSelectedProduct(null)
              }
            }}>
              Agregar al carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="precio" className="text-right">
                  Precio
                </Label>
                <Input
                  id="precio"
                  type="number"
                  value={newProduct.precio}
                  onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoria" className="text-right">
                  Categoría
                </Label>
                <select
                  id="categoria"
                  value={newProduct.categoria}
                  onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value as 'paletas' | 'crema' | 'porMayor' })}
                  className="col-span-3"
                >
                  <option value="paletas">Paletas</option>
                  <option value="crema">Crema</option>
                  <option value="porMayor">Por Mayor</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imagen" className="text-right">
                  Imagen
                </Label>
                <Input
                  id="imagen"
                  type="file"
                  ref={fileInputRef}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Agregar Producto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}