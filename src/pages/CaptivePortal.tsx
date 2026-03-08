import { useState, useEffect, useCallback } from 'react'
import { Wifi, CreditCard, CheckCircle, Clock, Loader2, AlertCircle, XCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration_hours: number
  bandwidth_profile: string
  device_limit: number
  is_voucher_enabled: boolean
}

type Step = 'plans' | 'phone' | 'paying' | 'success' | 'failed' | 'voucher'

export default function CaptivePortal() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [phone, setPhone] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [step, setStep] = useState<Step>('plans')
  const [paymentId, setPaymentId] = useState('')
  const [paying, setPaying] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [pollCount, setPollCount] = useState(0)

  // Fetch plans on mount
  useEffect(() => {
    api.get('/plans/').then(r => {
      setPlans(r.data)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load plans. Please refresh.')
      setLoading(false)
    })
  }, [])

  // Poll payment status
  useEffect(() => {
    if (step !== 'paying' || !paymentId) return

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/status/${paymentId}`)
        const { status, failure_reason } = res.data
        
        if (status === 'success') {
          clearInterval(interval)
          setStep('success')
          toast.success('Payment confirmed! Internet access activated.')
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(interval)
          setFailureReason(failure_reason || 'Payment was rejected or cancelled.')
          setStep('failed')
          setPaying(false)
          toast.error('Payment failed.')
        }
        
        setPollCount(c => c + 1)
        
        // Timeout after 60 seconds (12 polls of 5s)
        if (pollCount > 12) {
          clearInterval(interval)
          setFailureReason('Payment timed out. If you entered your PIN, please wait a moment.')
          setStep('failed')
          setPaying(false)
          toast.error('Payment timeout.')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [step, paymentId, pollCount])

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setStep('phone')
  }

  const handlePayment = async () => {
    // 1. Validate phone number
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error('Enter a valid phone number')
      return
    }
    
    if (!selectedPlan) return
    
    setPaying(true)
    setFailureReason('')
    
    try {
      // 2. Initiate payment with backend
      const res = await api.post('/payments/initiate', {
        phone_number: cleanPhone,
        plan_id: selectedPlan.id,
      })
      
      // 3. Only transition to 'paying' if backend confirms STK was sent
      if (res.data.success) {
        setPaymentId(res.data.payment_id)
        setStep('paying')
        setPollCount(0)
        toast.success('STK push sent! Check your phone.')
      } else {
        throw new Error(res.data.message || 'Initiation failed')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Payment initiation failed. Please try again.'
      toast.error(errorMsg)
      setFailureReason(errorMsg)
      setPaying(false)
    }
  }

  const handleVoucherRedeem = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!voucherCode.trim()) {
      toast.error('Enter a voucher code')
      return
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error('Enter your phone number first')
      return
    }
    setPaying(true)
    try {
      await api.post('/vouchers/redeem', {
        code: voucherCode.trim().toUpperCase(),
        phone_number: cleanPhone,
      })
      setStep('success')
      toast.success('Voucher redeemed! Internet activated.')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Voucher redemption failed.'
      toast.error(errorMsg)
    } finally {
      setPaying(false)
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours} Hour${hours > 1 ? 's' : ''}`
    const days = hours / 24
    return `${days} Day${days > 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HotSpot Portal</h1>
          <p className="text-blue-200 mt-1">Select a plan to access the internet</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step: Select Plan */}
          {step === 'plans' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Choose a Plan</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No plans available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full text-left p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 group-hover:text-blue-700">{plan.name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" /> {formatDuration(plan.duration_hours)}
                            </span>
                            {plan.bandwidth_profile && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Wifi className="w-3 h-3" /> {plan.bandwidth_profile}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">KES {plan.price}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => setStep('voucher')} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Have a voucher code? Redeem here →
                </button>
              </div>
            </div>
          )}

          {/* Step: Enter Phone */}
          {step === 'phone' && selectedPlan && (
            <div className="p-6">
              <button onClick={() => setStep('plans')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
                ← Back to plans
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Pay with M-Pesa</h2>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 font-medium">{selectedPlan.name}</p>
                <p className="text-2xl font-bold text-blue-800">KES {selectedPlan.price}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><CreditCard className="w-5 h-5" /> Pay KES {selectedPlan.price}</>}
                </button>
              </div>
            </div>
          )}

          {/* Step: Paying */}
          {step === 'paying' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Waiting for PIN</h2>
              <p className="text-gray-600 mb-6">
                A secure M-Pesa prompt has been sent to <strong>{phone}</strong>. 
                Please enter your PIN on your phone to complete the payment.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                Do not close this window. We will automatically activate your internet once Safaricom confirms the payment.
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Internet Active!</h2>
              <p className="text-gray-600 mb-6">
                Payment successful. Your internet access is now active. Enjoy!
              </p>
              <button
                onClick={() => { setStep('plans'); setSelectedPlan(null); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Step: Failed */}
          {step === 'failed' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{failureReason}</p>
              <button
                onClick={() => setStep('phone')}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Step: Voucher */}
          {step === 'voucher' && (
            <div className="p-6">
              <button onClick={() => setStep('plans')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
                ← Back to plans
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Redeem Voucher</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value)}
                    placeholder="ABC-123-XYZ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl uppercase"
                  />
                </div>
                <button
                  onClick={handleVoucherRedeem}
                  disabled={paying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redeem Voucher'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
