import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';


interface exportProps {
    data: any[];
}

const Export: React.FC <exportProps> = ({ data }) => {

    useEffect(() => {
        const deviceCheck = () => {
            if (Capacitor.getPlatform() !== "web") {
                return(
                    <div>
                    </div>
                )
            }
        }
        deviceCheck();
    }, []);



    const exportData = () =>{
        let exportData = JSON.stringify(data);

        const fileName = "export_lifelog.json";

        const blobbyboo = new Blob([exportData], {type: 'application/json'});

        let link = document.createElement("a");
        link.href = URL.createObjectURL(blobbyboo);
        link.download = fileName;
        link.click();

    }


    return (
        <div className="export">
            <button
                className="habit button"
                style={{
                    backgroundColor: 'var(--accent-alt)',
                }}
                onClick={exportData}
            >
                Export
            </button>
        </div>
    )
}

export default Export;