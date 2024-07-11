import React from 'react';


const NotesArea2 = ({ notes }) => {
    return (
        <>
            <div id="container">
                <pre>{notes}</pre>
            </div>
        </>
        
    );
};

export default NotesArea2;