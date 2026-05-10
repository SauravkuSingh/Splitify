import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'
import toast from 'react-hot-toast'

const JoinGroupPage = () => {
  const { inviteToken } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | joining | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      // Login nahi hai — signup pe bhejo, token save karo
      localStorage.setItem('splitify_pending_invite', inviteToken)
      navigate(`/signup?invite=${inviteToken}`)
      return
    }
    joinGroup()
  }, [user])

  const joinGroup = async () => {
    setStatus('joining')
    try {
      const res = await api.post(`/groups/join/${inviteToken}`)
      setStatus('success')
      toast.success(`Joined "${res.data.group.name}"! 🎉`)
      setTimeout(() => {
        navigate(`/groups/${res.data.group._id}`)
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid invite link'
      setMessage(msg)
      // Already member hai toh group ID se redirect karo
      if (msg.includes('already a member')) {
        setStatus('already')
      } else {
        setStatus('error')
      }
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Splitify</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {(status === 'loading' || status === 'joining') && (
            <>
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Joining group...</h2>
              <p className="text-sm text-gray-400">Please wait a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-5">🎉</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">You're in!</h2>
              <p className="text-sm text-gray-400">Redirecting to the group...</p>
            </>
          )}

          {status === 'already' && (
            <>
              <div className="text-5xl mb-5">👋</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Already a member!</h2>
              <p className="text-sm text-gray-400 mb-6">You're already in this group</p>
              <Link to="/dashboard" className="block bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Go to dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-5">😕</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid link</h2>
              <p className="text-sm text-gray-400 mb-6">{message || 'This invite link is invalid or expired'}</p>
              <Link to="/dashboard" className="block bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinGroupPage