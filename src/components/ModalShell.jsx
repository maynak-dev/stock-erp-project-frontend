import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Shared design tokens used by every modal
export const M = {
  panel:     { background:'var(--bg-card)', border:'1px solid var(--border2)', borderRadius:'16px',
               padding:'28px', width:'100%', maxWidth:'460px',
               boxShadow:'0 32px 80px rgba(0,0,0,.7)', position:'relative' },
  panelWide: { background:'var(--bg-card)', border:'1px solid var(--border2)', borderRadius:'16px',
               padding:'28px', width:'100%', maxWidth:'600px',
               boxShadow:'0 32px 80px rgba(0,0,0,.7)', position:'relative' },
  title:     { fontSize:'16px', fontWeight:700, color:'var(--t1)', margin:0 },
  label:     { display:'block', fontSize:'11px', fontWeight:600, color:'var(--t3)',
               letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'6px' },
  input:     { width:'100%', padding:'10px 13px', background:'var(--bg-elevated)',
               border:'1px solid var(--border2)', borderRadius:'9px', fontSize:'13px',
               color:'var(--t1)', fontFamily:'Sora,sans-serif', outline:'none',
               transition:'border-color .15s, box-shadow .15s', boxSizing:'border-box' },
  select:    { width:'100%', padding:'10px 13px', background:'var(--bg-elevated)',
               border:'1px solid var(--border2)', borderRadius:'9px', fontSize:'13px',
               color:'var(--t1)', fontFamily:'Sora,sans-serif', outline:'none',
               appearance:'none', boxSizing:'border-box' },
  textarea:  { width:'100%', padding:'10px 13px', background:'var(--bg-elevated)',
               border:'1px solid var(--border2)', borderRadius:'9px', fontSize:'13px',
               color:'var(--t1)', fontFamily:'Sora,sans-serif', outline:'none',
               resize:'vertical', minHeight:'80px', boxSizing:'border-box' },
  error:     { fontSize:'11px', color:'var(--rose)', marginTop:'4px' },
  group:     { marginBottom:'14px' },
  footer:    { display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'22px' },
  btnCancel: { padding:'9px 18px', borderRadius:'9px', background:'var(--bg-elevated)',
               border:'1px solid var(--border2)', fontSize:'13px', fontWeight:500,
               color:'var(--t2)', cursor:'pointer', fontFamily:'Sora,sans-serif' },
  btnSubmit: { padding:'9px 20px', borderRadius:'9px',
               background:'linear-gradient(135deg, var(--accent), #8b83ff)',
               border:'none', fontSize:'13px', fontWeight:600, color:'#fff',
               cursor:'pointer', fontFamily:'Sora,sans-serif',
               boxShadow:'0 4px 14px var(--accent-g)' },
};

export const onFocus = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-d)'; };
export const onBlur  = e => { e.target.style.borderColor='var(--border2)'; e.target.style.boxShadow='none'; };

// Reusable field components
export function Field({ label, name, type='text', register, errors, required, step }) {
  return (
    <div style={M.group}>
      <label style={M.label}>{label}{required && ' *'}</label>
      <input
        type={type} step={step}
        {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
        style={M.input} onFocus={onFocus} onBlur={onBlur}
      />
      {errors?.[name] && <p style={M.error}>{errors[name].message}</p>}
    </div>
  );
}

export function TextArea({ label, name, register, rows = 3 }) {
  return (
    <div style={M.group}>
      <label style={M.label}>{label}</label>
      <textarea {...register(name)} rows={rows} style={M.textarea} onFocus={onFocus} onBlur={onBlur}/>
    </div>
  );
}

export function Select({ label, name, register, errors, required, disabled, children }) {
  return (
    <div style={M.group}>
      <label style={M.label}>{label}{required && ' *'}</label>
      <select {...register(name)} disabled={disabled}
        style={{ ...M.select, opacity: disabled ? .6 : 1 }}
        onFocus={onFocus} onBlur={onBlur}>
        {children}
      </select>
      {errors?.[name] && <p style={M.error}>{errors[name].message}</p>}
    </div>
  );
}

// The modal shell — wraps any form with overlay + panel + close button
export default function ModalShell({ isOpen, onClose, title, children, wide = false }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ position:'fixed', inset:0, zIndex:50 }} onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)' }}/>
        </Transition.Child>
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center',
                      justifyContent:'center', padding:'24px', zIndex:51, overflowY:'auto' }}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={wide ? M.panelWide : M.panel}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <Dialog.Title style={M.title}>{title}</Dialog.Title>
                <button onClick={onClose}
                  style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', padding:'4px' }}>
                  <XMarkIcon style={{ width:16, height:16 }}/>
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
