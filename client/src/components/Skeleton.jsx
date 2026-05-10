// Reusable skeleton shimmer component
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
)

export const GroupCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-start gap-3 mb-4">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="w-7 h-7 rounded-full" />
      <Skeleton className="w-7 h-7 rounded-full -ml-2" />
      <Skeleton className="h-3 w-20 ml-2" />
    </div>
  </div>
)

export const ExpenseCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
)

export const GroupDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
      <div className="flex items-start gap-3 mb-5">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-50">
        {[1,2,3].map(i => (
          <div key={i} className="text-center">
            <Skeleton className="h-6 w-16 mx-auto mb-2" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-3">
      {[1,2,3].map(i => <ExpenseCardSkeleton key={i} />)}
    </div>
  </div>
)

export default Skeleton