import dynamic from 'next/dynamic'
import Layout from "@/components/Layout";
//import LocationFinder from '@/components/LocationFinder';



const LocationFinder = dynamic(() => import('@/components/LocationFinder'), {
    ssr: false, 
});

export default function standorte() {
    return (
        <Layout title="Standorte">{}
           <LocationFinder/> 
        </Layout>
    )
}
