import React, { useEffect } from "react"

function Container(props){
    return(
        <>
            {
                props.tablewide? 
                (
                    <div className={"container container--wide"}> 
                        {props.children}
                    </div>
                )
            :
                (
                    <div className={"container " + (props.wide ? '': 'container--narrow') + (props.top ? 'py-md-5': '')}>
                        {props.children}
                    </div>
                )
            }
        </>
        
        
    )
}

export default Container