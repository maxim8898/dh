import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { Article } from "@/components/drupal/Article"
import { BasicPage } from "@/components/drupal/BasicPage"
import { drupal } from "@/lib/drupal"
import type { Metadata, ResolvingMetadata } from "next"
import type { DrupalArticle, DrupalPage, DrupalProduct, NodesPath } from "@/types"
import { Plant } from "@/components/drupal/Plant"

async function getNode(slug: string[]) {
  const path = `/${slug.join("/")}`
  console.log(slug);

  try {
    const data = await drupal.query<{
      route: { entity: DrupalArticle | DrupalPage | DrupalProduct }
    }>({
      query: `query ($path: String!){
        route(path: $path) {
          ... on RouteInternal {
            entity {
              ... on NodePlant {
                __typename
                id
                title
                path
                body {
                  value
                  processed
                  format
                }
                images {
                  alt
                  url
                }
              }
              ... on NodeArticle {
                __typename
                id
                title
                path
                author {
                  name
                }
                description {
                  processed
                }
                status
                created {
                  time
                }
              }
            }
          }
        }
      }`,
      variables: {
        path,
      },
    })

    const resource = data?.route?.entity

    if (!resource) {
      throw new Error(`Failed to fetch resource: ${path}`, {
        cause: "DrupalError",
      })
    }

    return resource
  } catch (error) {
    throw error
  }
}

type NodePageParams = {
  slug: string[]
}
type NodePageProps = {
  params: NodePageParams
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: any,
  _: ResolvingMetadata
): Promise<Metadata> {
  const { params } = props;
  const { slug } =  await params;
  let node
  try {
    node = await getNode(slug)
  } catch (e) {
    // If we fail to fetch the node, don't return any metadata.
    return {}
  }

  return {
    title: node.title,
  }
}

export async function generateStaticParams(): Promise<NodePageParams[]> {
  try {
    // Fetch the paths for the first 50 articles.
    // We'll fall back to on-demand generation for the rest.
    const data = await drupal.query<{
      nodeArticles: NodesPath
    }>({
      query: `query {
        nodeArticles(first: 50) {
          nodes {
            path,
          }
        }
      }`,
    })

    if (!data?.nodeArticles?.nodes) {
      return []
    }

    const paths = [
      ...(data.nodeArticles.nodes as { path: string }[]),
    ].map(({ path }) => ({ slug: path.split("/").filter(Boolean) }))

    return paths
  } catch (error) {
    // Return empty array to avoid build failure
    return []
  }
}

export default async function Page(
  props: any
) {
  try {
    const { params } = props;
    const { slug } = await params;

    const draft = await draftMode()
    const isDraftMode = draft.isEnabled

    let node
    try {
      node = await getNode(slug)
    } catch (error) {
      // If getNode throws an error, tell Next.js the path is 404.
      notFound()
    }

    // If we're not in draft mode and the resource is not published, return a 404.
    if (!isDraftMode && node?.status === false) {
      notFound()
    }

    return (
      <>
        {node.__typename === "NodeArticle" && <Article node={node} />}
        {node.__typename === "NodePage" && <BasicPage node={node} />}
        {node.__typename === "NodePlant" && <Plant node={node} />}
      </>
    )
  } catch (error) {
    throw error
  }
}
