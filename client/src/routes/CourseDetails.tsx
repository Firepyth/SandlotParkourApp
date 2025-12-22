import { useParams } from "react-router"

export default function CourseDetails () {
    const { id } = useParams();

    return <>
        {id}
    </>
}