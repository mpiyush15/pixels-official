import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPaymentsPage() {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch payments from the CMS collection
  const paymentsResult = await payload.find({
    collection: 'payments',
    sort: '-createdAt',
    limit: 100,
  })

  const payments = paymentsResult.docs

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Subscription Payments History
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/admin/dashboard">
                Dashboard /
              </a>
            </li>
            <li className="font-medium text-primary">Subscription Payments</li>
          </ol>
        </nav>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Customer
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Plan Details
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Amount
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Razorpay ID
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, key) => (
                  <tr key={payment.id}>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {payment.customerName}
                      </h5>
                      <p className="text-sm">{payment.customerEmail}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white font-medium">
                        {payment.planName}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{payment.billingPeriod} Billing</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white font-medium">
                        {payment.currency === 'INR' ? '₹' : payment.currency}
                        {payment.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                          payment.status === 'success'
                            ? 'bg-success/10 text-success'
                            : payment.status === 'failed'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {payment.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                        {payment.status === 'failed' && <XCircle className="w-4 h-4" />}
                        {payment.status === 'pending' && <Clock className="w-4 h-4" />}
                        <span className="capitalize">{payment.status}</span>
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark text-sm">
                      {payment.razorpayPaymentId ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.razorpayPaymentId}
                        </code>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No subscription payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
