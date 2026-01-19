import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import TableSection from '../shared/TableSection';
import InstitutionTable from './institution/institutionTable';


const registerComp = () => {

    return (
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "สมัครสถาบัน" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">สมัครสถาบัน</h2>
                </div>

                <TableSection>
                    <InstitutionTable />
                </TableSection>
            </div>
        </div>
    )
}

export default registerComp
