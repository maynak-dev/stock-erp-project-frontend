import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { modalStyles as M, onFocus, onBlur } from '../../styles';

const schema = z.object({
  items: z.array(z.object({
    stockId: z.string().min(1,'Product required'),
    quantity: z.number().min(1,'Quantity must be at least 1'),
    reason: z.string().optional(),
  })).min(1,'At least one item required'),
});

export default function ReturnModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const { register, control, handleSubmit, formState:{errors}, reset } = useForm({
    resolver: zodResolver(schema), defaultValues:{items:[{stockId:'',quantity:1,reason:''}]}
  });
  const { fields, append, remove } = useFieldArray({ control, name:'items' });

  useEffect(() => {
    if (isOpen && user?.shopId) api.get('/stock?shopId='+user.shopId).then(r=>setStockItems(r.data)).catch(console.error);
  }, [isOpen, user]);

  const onSubmit = async (data) => {
    try { await api.post('/returns', data); toast.success('Return request created'); onSuccess(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to create return'); }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{position:'fixed',inset:0,zIndex:50}} onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)'}}/>
        </Transition.Child>
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',zIndex:51,overflowY:'auto'}}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={{...M.panel, maxWidth:'600px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <Dialog.Title style={{...M.title,margin:0}}>New Return Request</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {fields.map((field,i) => (
                    <div key={field.id} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'10px',padding:'14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                        <span style={{fontSize:'11px',fontWeight:600,color:'var(--t3)',letterSpacing:'.05em',textTransform:'uppercase'}}>Item {i+1}</span>
                        {fields.length > 1 && (
                          <button type="button" onClick={()=>remove(i)} style={{background:'rgba(255,90,126,.1)',border:'1px solid rgba(255,90,126,.2)',borderRadius:'6px',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--rose)'}}>
                            <TrashIcon style={{width:11,height:11}}/>
                          </button>
                        )}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'10px'}}>
                        <div>
                          <label style={M.label}>Product</label>
                          <select {...register(`items.${i}.stockId`)} style={M.select} onFocus={onFocus} onBlur={onBlur}>
                            <option value="">Select</option>
                            {stockItems.map(item=><option key={item.id} value={item.id}>{item.product.name} (Batch: {item.batchNumber})</option>)}
                          </select>
                          {errors.items?.[i]?.stockId && <p style={M.error}>{errors.items[i].stockId.message}</p>}
                        </div>
                        <div>
                          <label style={M.label}>Qty</label>
                          <input type="number" {...register(`items.${i}.quantity`,{valueAsNumber:true})} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                          {errors.items?.[i]?.quantity && <p style={M.error}>{errors.items[i].quantity.message}</p>}
                        </div>
                        <div>
                          <label style={M.label}>Reason</label>
                          <input {...register(`items.${i}.reason`)} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={()=>append({stockId:'',quantity:1,reason:''})}
                  style={{marginTop:'10px',display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'var(--accent-soft)',background:'none',border:'none',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:600}}>
                  <PlusIcon style={{width:13,height:13}}/> Add another item
                </button>
                {errors.items && !Array.isArray(errors.items) && <p style={M.error}>{errors.items.message}</p>}
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>Submit Request</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
