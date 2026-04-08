import * as React from 'react';
import './Sceleton.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

function Sceleton() {
  return (
    <Card
      className="SceletonCard"
      sx={{
        borderRadius: '12px;',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: 1200,
        m: 2,
        margin: 0,
      }}
    >
      <CardHeader
        action={null}
        title={<Skeleton animation="wave" height={40} width="90%" style={{ marginBottom: 6 }} />}
      />
      <CardContent sx={{ display: 'flex' }}>
        <Box sx={{ width: '100%' }}>
          <Skeleton animation="wave" height={40} style={{ marginBottom: 5 }} width="70%" />
          <Skeleton animation="wave" height={40} style={{ marginBottom: 6 }} width="70%" />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Skeleton animation="wave" height={60} style={{ marginBottom: 6 }} width="60%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default Sceleton;
