import logo from "../assets/metapumpkin.svg";
import { Panel } from "../components/ui";
import "./noaccess.css";

/**
 * In place of a page this viewer may not open: Data flow, for a viewer who may see some countries only
 * (src/visible.ts). The pipeline page shows the whole business's machinery, so it stays with the people who run it.
 */
export function NoAccessPage({ page }: { page: string }) {
  return <Panel label={page}>
    <div className="pd-noaccess" role="status">
      <img src={logo} alt="" width={96} height={96}/>
      <h1>Sorry, pumpkin</h1>
      <p>You don't have access to this page.</p>
      <p className="pd-noaccess-note">{page} is kept for the team that runs the pipeline. Ask an admin if you need it.</p>
    </div>
  </Panel>;
}
