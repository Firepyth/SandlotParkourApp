import { useParams } from "react-router";

export default function PlayerDetails () {
    const { id } = useParams();

    return <>
        {id}
    </>
}