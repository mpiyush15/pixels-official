import { BookOpen, FolderKanban, IndianRupee, PieChart, Wallet, BookMarked, Receipt } from 'lucide-react';

export default function SystemGuidePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">System Operation Guide</h1>
          <p className="text-text-muted mt-1">
            Complete workflow from creating a project to understanding your Profit & Loss statement.
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="ta-card bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold text-text-primary mb-2">How Our System Works</h3>
        <p className="text-text-secondary leading-relaxed">
          Our system is built on a <strong>Double-Entry Accounting System (Tally-Style)</strong>. This means every financial action you take in the CRM—like marking a project milestone as paid or logging a business expense—automatically updates the centralized <strong>Master Ledger</strong>. You no longer have to enter data twice.
        </p>
      </div>

      <div className="space-y-12">
        {/* Step 1 */}
        <section className="relative pl-12 border-l-2 border-border/50 space-y-6">
          <div className="absolute -left-5 top-0 bg-background border-2 border-border text-text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">1</div>
          
          <div className="flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary">Project Creation & Budgets</h2>
          </div>
          
          <div className="ta-card space-y-4">
            <p className="text-text-secondary">
              The workflow begins when you secure a new deal. You create a Project using the <strong>Operations &gt; Active Projects</strong> menu. 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li><strong>Phases & Milestones:</strong> During creation, you break down the project into specific delivery phases (e.g., "UI Design", "Development").</li>
              <li><strong>Budget Allocation:</strong> You assign a specific price/budget to each milestone. The total of these milestones becomes the Project's Total Revenue.</li>
              <li><em>At this stage, no money has hit your bank account. It is just a recorded project.</em></li>
            </ul>
          </div>
        </section>

        {/* Step 2 */}
        <section className="relative pl-12 border-l-2 border-border/50 space-y-6">
          <div className="absolute -left-5 top-0 bg-background border-2 border-border text-text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
          
          <div className="flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-text-primary">Receiving Payments & Invoices</h2>
          </div>
          
          <div className="ta-card space-y-4">
            <p className="text-text-secondary">
              When a client pays for a milestone, you go to the Project's detail page and update its payment status. This is where the magic happens.
            </p>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <h4 className="font-semibold text-text-primary mb-2">The Automated Magic:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary">
                <li>You select which milestone is paid, and choose the <strong>Bank/Cash Account</strong> where the money was received (e.g., "HDFC Current Account").</li>
                <li>The system automatically generates a Journal Entry in the Master Ledger.</li>
                <li><strong>Debit:</strong> HDFC Current Account (Asset goes UP)</li>
                <li><strong>Credit:</strong> Sales Revenue / SaaS Revenue (Revenue goes UP)</li>
              </ol>
            </div>
            <p className="text-text-secondary text-sm">
              * Note: You do NOT need to manually add Project Revenue to the Master Ledger. Marking a project phase as "Paid" handles it instantly. Invoices are auto-generated and stored for your records but the core financial tracking happens via this Ledger entry.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="relative pl-12 border-l-2 border-border/50 space-y-6">
          <div className="absolute -left-5 top-0 bg-background border-2 border-border text-text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">3</div>
          
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-danger" />
            <h2 className="text-2xl font-bold text-text-primary">Logging Expenses</h2>
          </div>
          
          <div className="ta-card space-y-4">
            <p className="text-text-secondary">
              Running a business costs money (SaaS tools, salaries, internet). These must be tracked against your revenue.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Go to <strong>Finance &gt; Expenses &gt; Add Expense</strong>.</li>
              <li>You must select a <strong>Payment Source</strong> (e.g., Cash or Bank) and an <strong>Expense Category</strong> (e.g., Software Subscriptions).</li>
              <li>Saving the expense automatically Debits the Expense account and Credits the Bank account, properly reducing your overall bank balance.</li>
            </ul>
          </div>
        </section>

        {/* Step 4 */}
        <section className="relative pl-12 border-l-2 border-border/50 space-y-6">
          <div className="absolute -left-5 top-0 bg-background border-2 border-border text-text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">4</div>
          
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-text-primary">Loans & Liabilities (Manual Entries)</h2>
          </div>
          
          <div className="ta-card space-y-4">
            <p className="text-text-secondary">
              Sometimes you receive money that isn't Revenue, like a Loan or Working Capital. Because this money is owed back, it should NOT appear on your Profit & Loss statement.
            </p>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <h4 className="font-semibold text-text-primary mb-2">How to Record a Loan (e.g., ₹50,000 Gold Loan):</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary">
                <li>Go to <strong>Chart of Accounts</strong> and create a Liability account named "Gold Loan".</li>
                <li>Go to <strong>Master Ledger</strong> and click "New Journal Entry".</li>
                <li><strong>Line 1:</strong> Select "Cash in Hand", Type: "Debit", Amount: "50000".</li>
                <li><strong>Line 2:</strong> Select "Gold Loan", Type: "Credit", Amount: "50000".</li>
                <li>Post the Entry. Your cash balance increases, but your Profit & Loss remains untouched!</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="relative pl-12 space-y-6">
          <div className="absolute -left-5 top-0 bg-background border-2 border-border text-text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm">5</div>
          
          <div className="flex items-center gap-3">
            <PieChart className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-text-primary">Profit & Loss and Dashboards</h2>
          </div>
          
          <div className="ta-card space-y-4">
            <p className="text-text-secondary">
              Everything flows into your reporting dashboards automatically.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-text-secondary">
              <li>
                <strong>Finance Hub:</strong> Shows real-time running balances of your Cash and Bank accounts based on every single Journal Entry you've made.
              </li>
              <li>
                <strong>Profit & Loss (Income Statement):</strong> Takes your Total Sales Revenue (from paid projects) and subtracts your Total Expenses (from the Expenses tab) to calculate your Net Profit.
              </li>
              <li>
                <strong>Balance Sheet:</strong> Shows your Assets (Cash/Bank balances) against your Liabilities (Loans).
              </li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
