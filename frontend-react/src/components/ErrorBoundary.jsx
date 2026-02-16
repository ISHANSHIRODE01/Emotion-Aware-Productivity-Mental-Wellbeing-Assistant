import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' }}
                    >
                        <AlertTriangle size={64} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                        <h1 style={{ marginBottom: '1rem' }}>Something went wrong</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px' }}>
                            We encountered an unexpected error. This might be due to a temporary glitch or a compatibility issue.
                        </p>

                        {this.state.error && (
                            <details style={{ marginBottom: '2rem', textAlign: 'left', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', maxWidth: '600px', overflowX: 'auto' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--accent-secondary)' }}>Error Details</summary>
                                <pre style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
                                    {this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            className="btn-primary"
                            onClick={this.handleReload}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={18} /> Reload Application
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
