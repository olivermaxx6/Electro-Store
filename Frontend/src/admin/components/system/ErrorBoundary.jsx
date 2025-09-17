import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(p){ super(p); this.state={hasError:false, error:null, info:null}; }
  static getDerivedStateFromError(error){ return {hasError:true, error} }
  componentDidCatch(error, info){ console.error('App crash:', error, info); this.setState({info}); }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen grid place-items-center">
          <div className="max-w-xl w-full rounded-xl border p-6">
            <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm opacity-80 mb-3">Reload or sign in again.</p>
            <div className="flex gap-2">
              <button onClick={()=>location.reload()} className="border rounded px-3 py-2">Reload</button>
              <button onClick={()=>{localStorage.removeItem('auth'); location.replace('/admin/sign-in')}} className="border rounded px-3 py-2">Go to Sign In</button>
            </div>
            <pre className="mt-3 text-xs opacity-70 max-h-48 overflow-auto">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}