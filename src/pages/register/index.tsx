import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Head from 'next/head';
import React from 'react'

import LayoutShellManagement from "@/comps/layouts/LayoutShellManagement";
import RegisterComp from "@/comps/register/registerComp";

function PageContent() {

    const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black px-8 py-4 bg-[#FAFAFA]">
             <RegisterComp />
        </div>
    );
}


export default function InstitutionRegister() {
    return (
        <>
            <Head>
                <title>สมัครสถาบัน</title>
                <meta name="description" content="Information Page" />
            </Head>

            <LayoutShellManagement>
                <PageContent></PageContent>
            </LayoutShellManagement>
        </>
    );
}

