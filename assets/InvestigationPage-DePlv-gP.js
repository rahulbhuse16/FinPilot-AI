import{r as e}from"./rolldown-runtime-hePW80VL.js";import{a as t,n,p as r,t as i}from"./useFetch-iHmAgKbu.js";import{t as a}from"./FinancialHealthGrid-CHlCTfGx.js";import{n as o,t as s}from"./LoadingSkeleton-UKNW6B1B.js";import{D as c,N as l,O as u,S as d,T as f,Y as p,_ as m,h,l as g,m as _,n as v,u as y}from"./index-CFKx3RR3.js";import{t as b}from"./customers.api-DmDnSXHF.js";import{t as x}from"./list-c3crtp94.js";import{t as S}from"./CustomerSelector-CqSs8Txh.js";import{n as C,r as w,t as T}from"./useAnalystConversation-DbkVTMoj.js";import{n as E,r as D,t as O}from"./TransactionTable-BF8bBO8B.js";var k=e(r(),1),A={list:({customerId:e,page:n,page_size:r,signal:i}={})=>t.get(`/customers/${e}/loans`,{params:{customer_id:e,page:n,page_size:r},signal:i}).then(e=>e.data),async handleLoanRequest(e,n){let{data:r}=await t.patch(`/admin/loans/${e}/`,n);return r}},j=n(),M=[{id:`health`,label:`Financial Health`,icon:m},{id:`transactions`,label:`Transactions`,icon:u},{id:`loans`,label:`Loans`,icon:l},{id:`anomalies`,label:`Anomalies`,icon:f},{id:`analysis`,label:`AI Analysis`,icon:d}];function N(){let e=h(e=>e.customer.selectedCustomer),t=_(),[n,r]=(0,k.useState)(`health`),{messages:f,send:m,isSending:N}=T(e?.id??null),P=e?.id,F=i(e=>b.get360(P,e),[P],!!P&&n===`health`),I=i(e=>D.list({customerId:P,page_size:20,signal:e}),[P],!!P&&n===`transactions`),L=i(e=>A.list({customerId:P,signal:e}),[P],!!P&&n===`loans`),R=i(e=>D.getAnomalies(P,e),[P],!!P&&n===`anomalies`),z=async e=>{await A.handleLoanRequest(e,{loan_id:e,status:`ACTIVE`})},B=async e=>{await A.handleLoanRequest(e,{loan_id:e,status:`REJECTED`})};return e?(0,j.jsxs)(`div`,{className:`mx-auto max-w-5xl space-y-5 p-4 sm:p-6`,children:[(0,j.jsx)(S,{value:e,onChange:e=>t(p(e))}),(0,j.jsx)(`div`,{className:`flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1`,children:M.map(e=>(0,j.jsxs)(`button`,{onClick:()=>r(e.id),className:`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${n===e.id?`bg-navy-900 text-white`:`text-slate-500 hover:bg-slate-100`}`,children:[(0,j.jsx)(e.icon,{className:`h-4 w-4`,strokeWidth:1.85}),e.label]},e.id))}),n===`health`&&(0,j.jsxs)(j.Fragment,{children:[F.status===`loading`&&(0,j.jsx)(`div`,{className:`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`,children:Array.from({length:4}).map((e,t)=>(0,j.jsx)(s,{rows:2},t))}),F.status===`error`&&(0,j.jsx)(y,{message:F.error?.message,onRetry:F.refetch}),F.status===`success`&&F.data&&(0,j.jsx)(a,{profile:F.data})]}),n===`transactions`&&(0,j.jsxs)(j.Fragment,{children:[I.status===`loading`&&(0,j.jsx)(o,{rows:6}),I.status===`error`&&(0,j.jsx)(y,{message:I.error?.message,onRetry:I.refetch}),I.status===`success`&&x(I.data).length===0&&(0,j.jsx)(g,{icon:u,title:`No transactions`,description:`This customer has no recorded transactions.`}),I.status===`success`&&x(I.data).length>0&&(0,j.jsx)(O,{transactions:x(I.data)})]}),n===`loans`&&(0,j.jsxs)(j.Fragment,{children:[L.status===`loading`&&(0,j.jsx)(o,{rows:4}),L.status===`error`&&(0,j.jsx)(y,{message:L.error?.message,onRetry:L.refetch}),L.status===`success`&&x(L.data).length===0&&(0,j.jsx)(g,{icon:l,title:`No loans on record`,description:`This customer has no active or historical loans.`}),L.status===`success`&&x(L.data).length>0&&(0,j.jsx)(`div`,{className:`overflow-hidden rounded-xl border border-slate-200 bg-white`,children:(0,j.jsx)(`ul`,{children:x(L.data).map(e=>(0,j.jsx)(`li`,{className:`
    group relative overflow-hidden
    border-b border-slate-100/80
    px-5 py-4
    transition-all duration-200
    hover:bg-slate-50/70
    last:border-0
  `,children:(0,j.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,j.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,j.jsx)(`div`,{className:`
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          shadow-sm
          text-slate-600
        `,children:(0,j.jsxs)(`svg`,{className:`h-4.5 w-4.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,j.jsx)(`path`,{d:`M3 10.5 12 4l9 6.5`}),(0,j.jsx)(`path`,{d:`M5 10v9h14v-9`}),(0,j.jsx)(`path`,{d:`M9 19v-5h6v5`})]})}),(0,j.jsxs)(`div`,{children:[(0,j.jsx)(`p`,{className:`text-sm font-semibold tracking-[-0.01em] text-slate-900`,children:e.loan_type??`Loan`}),(0,j.jsxs)(`p`,{className:`mt-0.5 text-xs text-slate-500`,children:[`Interest rate`,` `,(0,j.jsxs)(`span`,{className:`font-medium text-slate-700`,children:[e.interest_rate??`—`,`%`]})]})]})]}),(0,j.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,j.jsx)(`span`,{className:`font-mono-num text-sm font-semibold text-slate-900`,children:v(e.outstanding_balance)}),e.salary_slip_url&&(0,j.jsxs)(`button`,{type:`button`,onClick:()=>window.open(e.salary_slip_url,`_blank`),className:`
            inline-flex items-center gap-1.5
            rounded-lg
            border border-slate-200
            bg-white
            px-3 py-1.5
            text-xs font-semibold
            text-slate-600
            shadow-sm
            transition-all duration-200
            hover:border-blue-300
            hover:bg-blue-50
            hover:text-blue-700
            active:scale-[0.97]
          `,children:[(0,j.jsxs)(`svg`,{className:`h-3.5 w-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,j.jsx)(`path`,{d:`M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z`}),(0,j.jsx)(`circle`,{cx:`12`,cy:`12`,r:`2.5`})]}),`View Document`]}),e.status?.toUpperCase()===`ACTIVE`?(0,j.jsxs)(`div`,{className:`
            inline-flex items-center gap-1.5
            rounded-full
            border border-emerald-200
            bg-emerald-50
            px-3 py-1.5
            text-xs font-semibold
            text-emerald-700
          `,children:[(0,j.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-emerald-500`}),`Approved`]}):e.status?.toUpperCase()===`REJECTED`?(0,j.jsxs)(`div`,{className:`
            inline-flex items-center gap-1.5
            rounded-full
            border border-red-200
            bg-red-50
            px-3 py-1.5
            text-xs font-semibold
            text-red-700
          `,children:[(0,j.jsx)(`span`,{className:`h-1.5 w-1.5 rounded-full bg-red-500`}),`Rejected`]}):(0,j.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,j.jsxs)(`button`,{type:`button`,onClick:()=>z(e.id),className:`
              group/approve
              inline-flex items-center gap-1.5
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-1.5
              text-xs font-semibold
              text-slate-700
              shadow-sm
              transition-all duration-200
              hover:border-emerald-300
              hover:bg-emerald-50
              hover:text-emerald-700
              hover:shadow-emerald-100
              active:scale-[0.97]
            `,children:[(0,j.jsx)(`svg`,{className:`h-3.5 w-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,j.jsx)(`path`,{d:`m5 12 4 4L19 6`})}),`Approve`]}),(0,j.jsxs)(`button`,{type:`button`,onClick:()=>B(e.id),className:`
              inline-flex items-center gap-1.5
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-1.5
              text-xs font-semibold
              text-slate-500
              shadow-sm
              transition-all duration-200
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.97]
            `,children:[(0,j.jsx)(`svg`,{className:`h-3.5 w-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,j.jsx)(`path`,{d:`M6 6l12 12M18 6 6 18`})}),`Reject`]})]})]})]})},e.id))})})]}),n===`anomalies`&&(0,j.jsxs)(j.Fragment,{children:[R.status===`loading`&&(0,j.jsxs)(`div`,{className:`grid grid-cols-1 gap-3 sm:grid-cols-2`,children:[(0,j.jsx)(s,{rows:2}),(0,j.jsx)(s,{rows:2})]}),R.status===`error`&&(0,j.jsx)(y,{message:R.error?.message,onRetry:R.refetch}),R.status===`success`&&x(R.data).length===0&&(0,j.jsx)(g,{title:`No anomalies detected`,description:`Transaction activity for this customer looks normal.`}),R.status===`success`&&x(R.data).length>0&&(0,j.jsx)(`div`,{className:`grid grid-cols-1 gap-3 sm:grid-cols-2`,children:x(R.data).map(e=>(0,j.jsx)(E,{anomaly:e},e.id))})]}),n===`analysis`&&(0,j.jsxs)(`div`,{className:`flex flex-col rounded-xl border border-slate-200 bg-white`,children:[(0,j.jsxs)(`div`,{className:`flex-1 space-y-5 px-4 py-5 sm:px-6`,children:[f.length===0&&(0,j.jsx)(g,{icon:d,title:`Ask for a complete risk assessment`,description:`One question orchestrates multiple backend tools — Customer 360, transaction analysis, and loan analysis — for ${e.full_name}.`}),f.map(e=>(0,j.jsx)(w,{message:e},e.id))]}),(0,j.jsx)(C,{onSend:m,isLoading:N})]})]}):(0,j.jsxs)(`div`,{className:`mx-auto max-w-5xl space-y-5 p-4 sm:p-6`,children:[(0,j.jsx)(S,{value:e,onChange:e=>t(p(e)),placeholder:`Select a customer to begin investigation`}),(0,j.jsx)(g,{icon:c,title:`Select a customer to begin`,description:`The investigation workspace pulls financial health, transactions, loans, and anomaly data together, then lets the AI analyst reason across all of it in one question.`})]})}export{N as InvestigationPage};