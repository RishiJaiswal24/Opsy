"use client"
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Info } from 'lucide-react'
import Script from "next/script"
import React, { useEffect, useState } from 'react'
import { fetchNoOfPayments, fetchUserCredits, initiate } from '@/app/actions/useractions'
import { ToastContainer, toast } from 'react-toastify'
import { Bounce } from 'react-toastify'

const BillingPage = () => {
  const [creditsToBuy, setCreditsToBuy] = useState([100])
  const creditsToBuyAmount = creditsToBuy[0]
  const price = (creditsToBuyAmount * 3)
  const [userCredits, setUserCredits] = useState(0)
  const [paymentSet, setPaymentSet] = useState([])
  const [credits, setCredits] = useState(0);

  const showCredits = async () => {
    const data = await fetchUserCredits();
    if (data.success) {
      setCredits(data.credits);
    } else {
      toast.error("Failed to load credits: " + data.error, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  useEffect(() => {
    showCredits();
  }, []);

  useEffect(() => {
    async function run() {
      const result = await fetchNoOfPayments();
      setPaymentSet(result);
    }
    run();
  }, []);

  const pay = async (amount) => {
    const paisa =amount *100;
    let a = await initiate(paisa, creditsToBuyAmount)
    let order_id = a.id
    var options = {
      "key": process.env.NEXT_PUBLIC_RAZORPAY_ID,
      "amount": amount,
      "currency": "INR",
      "name": "Opsy",
      "description": "Support Contribution",
      "image": "https://example.com/your_logo",
      "order_id": order_id,
      "callback_url": `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
      "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "+919876543210"
      },
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "theme": {
        "color": "#3399cc"
      }

    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>
      <h1 className='text-xl font-semibold'>Billing</h1>
      <div className="h-2"></div>
      <p className='text-sm text-gray-500'>
        You currently have {credits} credits
      </p>
      <div className="h-2"></div>
      <div className='bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700'>
        <div className='flex items-center gap-2'>
          <Info className='size-4' />
          <p className='text-sm'>Each credit allows you to index 1 file in a repository.</p>
        </div>
        <p className='text-sm'>Eg: If your project have 100 files. you will need 100 credit to index it.</p>
      </div>
      <div className="h-4"></div>
      <Slider defaultValue={[100]} max={1000} min={10} step={10} onValueChange={value => { setCreditsToBuy(value) }} value={creditsToBuy} />
      <div className="h-4"></div>
      <Button onClick={() => { pay(price) }}>
        Buy {creditsToBuyAmount} credits for ₹{price}
      </Button>
      <div className="h-4"></div>
      {paymentSet.map((payment, idx) => {
        return <div key={idx} className="flex justify-between items-center my-2 bg-white rounded-lg p-4 shadow-xl border transition-transform duration-300 hover:scale-[1.02]">

          <div className="flex items-center gap-2">
            <p className="text-gray-700 text-lg font-medium">
              {payment.credits} credits
            </p>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(payment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-green-500 font-bold ">
            Rs.{payment.amount / 100}
          </p>

        </div>

      })}

    </>
  )
}

export default BillingPage
