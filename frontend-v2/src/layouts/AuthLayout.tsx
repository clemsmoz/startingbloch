import React from 'react';

const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	return (
		<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
			{children}
		</div>
	);
};

export default AuthLayout;

