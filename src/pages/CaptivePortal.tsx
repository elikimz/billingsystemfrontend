import { useState, useEffect } from 'react'
import { Wifi, CreditCard, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'
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

type Step = 'plans' | 'phone' | 'paying' | 'success' | 'voucher'

export default function CaptivePortal() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [phone, setPhone] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [step, setStep] = useState<Step>('plans')
  const [paymentId, setPaymentId] = useState('')
  const [paying, setPaying] = useState(false)
  const [pollCount, setPollCount] = useState(0)

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
        const status = res.data.status
        if (status === 'success') {
          clearInterval(interval)
          setStep('success')
          toast.success('Payment confirmed! Internet access activated.')
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(interval)
          setPaying(false)
          setStep('phone')
          toast.error('Payment failed or cancelled. Please try again.')
        }
        setPollCount(c => c + 1)
        if (pollCount > 30) {
          clearInterval(interval)
          setPaying(false)
          setStep('phone')
          toast.error('Payment timeout. Please check your M-Pesa and try again.')
        }
      } catch {
        // ignore poll errors
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [step, paymentId, pollCount])

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setStep('phone')
  }

  const handlePayment = async () => {
    // Basic phone validation
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Enter a valid phone number (e.g. 0712345678)')
      return
    }
    
    if (!selectedPlan) return
    setPaying(true)
    try {
      const res = await api.post('/payments/initiate', {
        phone_number: cleanPhone,
        plan_id: selectedPlan.id,
      })
      setPaymentId(res.data.payment_id)
      setStep('paying')
      toast.success('STK push sent! Check your phone for M-Pesa prompt.')
    } catch (err: any) {
      const errorData = err.response?.data
      const message = errorData?.details || errorData?.detail || errorData?.error || 'Payment initiation failed. Please try again.'
      toast.error(message)
      setPaying(false)
    }
  }

  const handleVoucherRedeem = async () => {
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    if (!voucherCode.trim()) {
      toast.error('Enter a voucher code')
      return
    }
    if (!cleanPhone || cleanPhone.length < 10) {
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
      toast.success('Voucher redeemed! Internet access activated.')
    } catch (err: any) {
      const errorData = err.response?.data
      const message = errorData?.details || errorData?.detail || errorData?.error || 'Voucher redemption failed.'
      toast.error(message)
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
          <p className="text-blue-200 mt-1">Purchase a plan to access the internet</p>
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
                  <p>No plans available at the moment.</p>
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
                          {plan.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                          )}
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
              {/* Voucher option */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep('voucher')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
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
                <p className="text-xs text-blue-600">{formatDuration(selectedPlan.duration_hours)} access</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the number registered with M-Pesa</p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pay KES {selectedPlan.price}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Waiting for payment */}
          {step === 'paying' && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Waiting for Payment</h2>
              <p className="text-gray-600 mb-4">
                An M-Pesa STK push has been sent to <strong>{phone}</strong>.
                <br />Enter your PIN to complete the payment.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Do not close this page. We'll automatically activate your internet once payment is confirmed.
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Internet Activated!</h2>
              <p className="text-gray-600 mb-4">
                Your subscription is now active. You can browse the internet freely.
              </p>
              <p className="text-sm text-gray-500">
                An SMS confirmation has been sent to {phone}.
              </p>
              <button
                onClick={() => { setStep('plans'); setSelectedPlan(null); setPhone(''); }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Back to home
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC12345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
                <button
                  onClick={handleVoucherRedeem}
                  disabled={paying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Redeeming...</>
                  ) : (
                    'Redeem Voucher'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-blue-200 text-xs mt-4">
          Powered by HotSpot Billing System
        </p>
      </div>
    </div>
  )
}
