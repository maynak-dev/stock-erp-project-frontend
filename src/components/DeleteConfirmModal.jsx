import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Reusable dark-themed delete confirmation modal.
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   onConfirm — () => void
 *   title     — string  e.g. "Delete Company"
 *   message   — string  e.g. "Are you sure you want to delete Mio Amore?"
 *   loading   — boolean (optional) disables confirm button while deleting
 */
export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure you want to delete this item? This action cannot be undone.', loading = false }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ position:'fixed', inset:0, zIndex:60 }} onClose={onClose}>

        {/* Backdrop */}
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)' }}/>
        </Transition.Child>

        {/* Panel */}
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', zIndex:61 }}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">

            <Dialog.Panel style={{
              width:'100%', maxWidth:'400px',
              background:'var(--bg-card)',
              border:'1px solid var(--border2)',
              borderRadius:'16px',
              padding:'28px',
              boxShadow:'0 32px 80px rgba(0,0,0,.8)',
            }}>

              {/* Icon + Title */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'20px' }}>
                {/* Danger icon circle */}
                <div style={{
                  width:'52px', height:'52px', borderRadius:'50%',
                  background:'rgba(255,90,126,0.12)',
                  border:'1px solid rgba(255,90,126,0.25)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginBottom:'16px',
                }}>
                  <ExclamationTriangleIcon style={{ width:'24px', height:'24px', color:'var(--rose)' }}/>
                </div>

                <Dialog.Title style={{ fontSize:'16px', fontWeight:700, color:'var(--t1)', margin:'0 0 8px' }}>
                  {title}
                </Dialog.Title>
                <p style={{ fontSize:'13px', color:'var(--t3)', lineHeight:'1.6', margin:0 }}>
                  {message}
                </p>
              </div>

              {/* Divider */}
              <div style={{ height:'1px', background:'var(--border)', margin:'0 0 20px' }}/>

              {/* Actions */}
              <div style={{ display:'flex', gap:'10px' }}>
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    flex:1, padding:'10px 0',
                    background:'var(--bg-elevated)',
                    border:'1px solid var(--border2)',
                    borderRadius:'9px',
                    fontSize:'13px', fontWeight:600,
                    color:'var(--t2)', cursor:'pointer',
                    fontFamily:'Sora,sans-serif',
                    transition:'all .15s',
                    opacity: loading ? .5 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.color='var(--t1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--t2)'; }}
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  style={{
                    flex:1, padding:'10px 0',
                    background: loading ? 'rgba(255,90,126,.3)' : 'linear-gradient(135deg, #ff5a7e, #e0365c)',
                    border:'1px solid rgba(255,90,126,.4)',
                    borderRadius:'9px',
                    fontSize:'13px', fontWeight:600,
                    color:'#fff', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily:'Sora,sans-serif',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(255,90,126,.35)',
                    transition:'all .15s',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity='.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}
                >
                  {loading ? 'Deleting…' : 'Delete'}
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
