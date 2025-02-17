import React, { useState } from 'react';
import './Cart.css'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Link } from 'react-router-dom'
import useCartContext from '../../Context/CartContext'
import firebase from "firebase/compat/app"
import "firebase/firestore"
import { getFirestore } from '../Firebase/Firebase'
import Formulario from '../Formulario/Formulario'

const Cart = () => {
    const { products, removeItem, totalProductsPrice, cleanListCart } = useCartContext();
    const [showForm, setShowForm] = useState(false)
    const [orderId, setOrderId] = useState("")
    const [confirmation, setConfirmation] = useState(false)

    const handleRemove = (i) => {
        removeItem(i.id)
    }
    const handleFinalize = () => {
        setShowForm(true)
    }

    const createOrder = (buyer) => {
        const db = getFirestore()
        const orders = db.collection('order')

        const newOrder = {
            buyer,
            products,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
            total: totalProductsPrice()
        }

        orders.add(newOrder).then(({ id }) => {
            setOrderId(id)
            setConfirmation(true)
        }
        ).catch((e) => { console.log(e) })

        const Itemscollection = db.collection("ItemCollection")
        const batch = getFirestore().batch()

        products.forEach(p => {
            batch.update(Itemscollection.doc(p.id), { stock: p.stock - p.quantity })
        })
        batch.commit()
            .then(() => {
                console.log("Salio bien")
                cleanListCart()
            })
            .catch(err => console.log(err))
    }

    console.log("Confirmación", confirmation)
    console.log("orderId", orderId)

    if (products.length === 0 && orderId === "") {
        return (
            <div className="cart">
                <div className="headCart">
                    <h3>...No hay productos en el Carrito...</h3>
                    <Link to="/" exact>
                        <button className="continueCart">Continuar Comprando</button>
                    </Link>
                </div>
            </div>
        )
    } else if (orderId && confirmation) {
        return (
            <div className="cart">
                <div className="headCart">
                    <h3>Su Orden No. <span className="validation">{orderId}</span> ha sido confirmada</h3>
                    <Link to="/" exact>
                        <button className="continueCart">Continuar Comprando</button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <section className="cart">
            <div className="headCart">
                <h2>Carrito de Compras</h2>
                <Link to="/" exact>
                    <button className="continueCart">Continuar Compra</button>
                </Link>
            </div>
            <div className="compraCart">
                {products.map((item) => (
                    <div className="productoCart">
                        <div className="cartImg">
                            <img className='image' src={item.img} alt={item.id} />
                        </div>
                        <div className="productoCartDetail">
                            <h3>{item.name}</h3>
                            <div className="cartRemoval">
                                <button class="removalCart" onClick={() => handleRemove(item)}><DeleteForeverIcon /></button>
                            </div>
                        </div>
                        <div className="productoCartPrice">
                            <MonetizationOnIcon />
                            <label htmlFor="price">Precio: </label>
                            <span className="price">COP ${item.price}</span>
                        </div>
                        <div className="cartContador">
                            <ProductionQuantityLimitsIcon />
                            <label htmlFor="quantity">Cantidad: </label>
                            <span className="contador">{item.quantity}</span>
                        </div>
                        <div className="cartPrice">
                            <CardGiftcardIcon />
                            <label htmlFor="total">Total: </label>
                            <span className="total">COP ${item.quantity * item.price}</span>
                        </div>
                    </div>
                )
                )}
            </div>
            <div className="cartTotal" >
                <div className="cartTotalItem">
                    <OfflinePinIcon />
                    <label>Subtotal: </label>
                    <div className="cartValue">{totalProductsPrice()}</div>
                </div>
                <div className="cartTotalItem">
                    <LocalShippingIcon />
                    <label>Costo de envío:</label>
                    <div className="cartValue"> 5300</div>
                </div>
                <div className="cartTotalItem">
                    <AccountBalanceWalletIcon />
                    <label>Total a Pagar: </label>
                    <div className="cartValue">{totalProductsPrice() + 5300}</div>
                </div>
                <div className="cartTotalItem">
                    <button className="checkout" onClick={handleFinalize}>Inicia tu Compra</button>
                </div>
            </div>
            {showForm ? <Formulario createOrder={createOrder} /> : null}
        </section>
    )
}
export default Cart;
