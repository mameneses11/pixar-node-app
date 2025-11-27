import React from 'react';
import PixarNode from './PixarNode';
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <div className="p-4 md:p-10">
          <PixarNode />
          <ToastContainer />
        </div>
    );
}

export default App;