import { PlayerImg } from "./stylePresets/presetStyles";

export default function PlaceholderCourseTable () {
    return <table className="mb-[.5rem]">
        <tbody>
            <tr>
                <td className="font-semibold">Date added:</td>
                <td>–</td>
            </tr>
            <tr>
                <td className="font-semibold">Total completions:</td>
                <td>–</td>
            </tr>
            <tr>
                <td className="font-semibold pb-[1rem]">Players completed:</td>
                <td className="pb-[1rem]">–</td>
            </tr>
            <tr>
                <td className="font-semibold">Fastest player:</td>
                <td><PlayerImg player_id={undefined} player_name="" className="w-[1.5rem] h-[1.5rem] inline-block mt-[-.125rem]"/> –</td>
            </tr>
            <tr>
                <td className="font-semibold">Fastest time:</td>
                <td>00:00:00.000</td>
                <td>(– deaths)</td>
            </tr>
            <tr>
                <td className="font-semibold pb-[1rem]">Average first time:</td>
                <td className="pb-[1rem]">00:00:00.000</td>
                <td className="pb-[1rem]">(– deaths)</td>
            </tr>
        </tbody>
    </table>
}