import { ImageResponse } from "next/og";
import { getProjectsMetadata } from "@/app/(actions)/get-projects-metadata";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const projectsMetadataRes = await getProjectsMetadata();
    const numDisqualified = projectsMetadataRes?.invocations > 0 ? projectsMetadataRes?.invocations - projectsMetadataRes?.num_qualified : "N/A"
    const gameStartDate = new Date((projectsMetadataRes?.game_start_datetime ?? 0) * 1000)
    const currentDate = new Date();
    const diffMs = currentDate - gameStartDate;
    const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
          height: "100vh",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 24,
            paddingRight: 24,
            lineHeight: 1.2,
            fontSize: 36,
            color: "black",
            flex: 1,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              color: "#0a588c",
              fontSize: 50,
              marginBottom: 12,
              display: "flex"
            }}
          >
            <strong>Disqualified</strong>
          </div>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
            }}
          >
            &quot;{numDisqualified}&quot;
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 24,
            paddingRight: 24,
            lineHeight: 1.2,
            fontSize: 36,
            color: "black",
            flex: 1,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              color: "#0a588c",
              fontSize: 50,
              marginBottom: 12,
              display: "flex"
            }}
          >
            <strong>Qualified</strong>
          </div>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
            }}
          >
            &quot;{projectsMetadataRes?.num_qualified}&quot;
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 24,
            paddingRight: 24,
            lineHeight: 1.2,
            fontSize: 36,
            color: "black",
            flex: 1,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              color: "#0a588c",
              fontSize: 50,
              marginBottom: 12,
              display: "flex"
            }}
          >
            <strong>Days</strong>
          </div>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
            }}
          >
            &quot;{elapsedDays}&quot;
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 24,
            paddingRight: 24,
            lineHeight: 1.2,
            fontSize: 36,
            color: "black",
            flex: 1,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              color: "#0a588c",
              fontSize: 50,
              marginBottom: 12,
              display: "flex"
            }}
          >
            <strong>Total ETH</strong>
          </div>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
            }}
          >
            &quot;{projectsMetadataRes?.total_eth}&quot;
          </div>
        </div>
      </div>
    ),
    {
      width: 1528,
      height: 800,
      fonts: [
        {
          name: "Inter",
          data: interReg,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: 800,
          style: "normal",
        },
      ],
    }
  );
}