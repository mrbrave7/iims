interface PageProps {
    params: {
      id: string;
    };
    searchParams: { [key: string]: string | string[] | undefined };
  }
export default function page({ params }: PageProps):React.ReactElement{
    const {id} = params
    return(
        <div>
            hello guys {id}
        </div>
    )
}