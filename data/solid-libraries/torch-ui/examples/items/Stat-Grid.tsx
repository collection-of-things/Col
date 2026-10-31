import TrendingUp from 'lucide-solid/icons/trending-up';
import TrendingDown from 'lucide-solid/icons/trending-down';
import Users from 'lucide-solid/icons/users';
import ShoppingCart from 'lucide-solid/icons/shopping-cart';
import DollarSign from 'lucide-solid/icons/dollar-sign';
import Activity from 'lucide-solid/icons/activity';

import { StatCard } from '@torch-ui/solid/data-display'

import { Sparkline } from '@torch-ui/solid/data-display'



const revenueData = [4200, 3800, 5100, 4700, 6200, 5800, 7400, 6900, 8100, 7600, 9200, 8800]
const usersData   = [120, 145, 132, 160, 178, 165, 190, 210, 198, 225, 242, 238]
const ordersData  = [85, 92, 78, 95, 110, 98, 115, 125, 108, 132, 128, 140]
const churnData   = [3.2, 3.8, 4.1, 3.6, 3.1, 2.9, 3.4, 3.7, 4.2, 3.8, 3.5, 3.1]

export function StatGrid() {
  return (
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Monthly Revenue"
        value="$87,492"
        trendLabel="+14.2% from last month"
        trendVariant="positive"
        trendIcon={<TrendingUp class="h-3.5 w-3.5" />}
        icon={<DollarSign class="h-5 w-5 text-emerald-600" />}
        chart={<Sparkline data={revenueData} color="#10b981" class="h-10" />}
        chartA11yLabel="Revenue trend over last 12 months"
      />
      <StatCard
        label="Active Users"
        value="2,381"
        trendLabel="+8.7% from last month"
        trendVariant="positive"
        trendIcon={<TrendingUp class="h-3.5 w-3.5" />}
        icon={<Users class="h-5 w-5 text-blue-600" />}
        chart={<Sparkline data={usersData} color="#3b82f6" class="h-10" />}
        chartA11yLabel="Active users trend over last 12 months"
      />
      <StatCard
        label="Orders"
        value="1,402"
        trendLabel="+11.3% from last month"
        trendVariant="positive"
        trendIcon={<TrendingUp class="h-3.5 w-3.5" />}
        icon={<ShoppingCart class="h-5 w-5 text-violet-600" />}
        chart={<Sparkline data={ordersData} color="#7c3aed" class="h-10" />}
        chartA11yLabel="Order count trend over last 12 months"
      />
      <StatCard
        label="Churn Rate"
        value="3.1%"
        trendLabel="-0.4% from last month"
        trendVariant="positive"
        trendIcon={<TrendingDown class="h-3.5 w-3.5" />}
        icon={<Activity class="h-5 w-5 text-amber-600" />}
        chart={<Sparkline data={churnData} color="#d97706" class="h-10" />}
        chartA11yLabel="Churn rate trend over last 12 months"
      />
    </div>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <StatGrid />, target); }
