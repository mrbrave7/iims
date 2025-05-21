import { useAdminContext } from "../Context/AdminProvider"

export default function Logout():React.ReactElement{
    const {signOutAdmin} = useAdminContext()
    return(
        <button className="bg-stone-100 text-orange-600 font-bold rounded dark:bg-stone-900 p-2" onClick={signOutAdmin}>
            SignOut
        </button>
    )
}